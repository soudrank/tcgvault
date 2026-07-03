import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchEbayPrices } from '@/lib/ebay';

export const maxDuration = 60;

const BATCH_SIZE = 5;
const DELAY_MS = 2000;
const CARDS_PER_RUN = 80;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // card_masterからebay_queryが設定されているカードを取得
  // ebay_cacheのcreated_atが古い or キャッシュがないものを優先
  const { data: allCards, error } = await supabase
    .from('card_master')
    .select('id, ebay_query, card_name, model_number, set_code')
    .not('ebay_query', 'is', null)
    .neq('ebay_query', '');

  if (error || !allCards?.length) {
    return NextResponse.json({
      message: 'No cards with ebay_query found',
      error: error?.message,
    });
  }

  // 既存キャッシュの最終更新日を取得
  const queries = allCards.map((c) => c.ebay_query as string);
  const cacheKeys = queries.map((q) => q.toLowerCase());

  const { data: cachedEntries } = await supabase
    .from('ebay_cache')
    .select('query_key, created_at')
    .in('query_key', cacheKeys);

  const cacheMap = new Map<string, string>();
  if (cachedEntries) {
    for (const entry of cachedEntries) {
      cacheMap.set(entry.query_key, entry.created_at);
    }
  }

  // キャッシュなし → 古い順にソート
  const sorted = allCards.sort((a, b) => {
    const aKey = (a.ebay_query as string).toLowerCase();
    const bKey = (b.ebay_query as string).toLowerCase();
    const aTime = cacheMap.get(aKey);
    const bTime = cacheMap.get(bKey);
    if (!aTime && !bTime) return 0;
    if (!aTime) return -1;
    if (!bTime) return 1;
    return new Date(aTime).getTime() - new Date(bTime).getTime();
  });

  // 上位N件を取得（重複クエリを除外）
  const seen = new Set<string>();
  const targets: { query: string; cardId: number }[] = [];
  for (const card of sorted) {
    const q = card.ebay_query as string;
    const key = q.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({ query: q, cardId: card.id });
    if (targets.length >= CARDS_PER_RUN) break;
  }

  let success = 0;
  let errors = 0;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async ({ query }) => {
        const cacheKey = query.toLowerCase();
        const items = await fetchEbayPrices(query);
        await supabase.from('ebay_cache').upsert({
          query_key: cacheKey,
          response: { items },
          created_at: new Date().toISOString(),
        });
        return { cacheKey, count: items.length };
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled') {
        success++;
      } else {
        errors++;
        console.error('[Catalog Cron] Failed:', r.reason);
      }
    }

    if (i + BATCH_SIZE < targets.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  // API使用量を記録
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  const { data: existing } = await supabase
    .from('daily_api_usage')
    .select('*')
    .eq('date', today)
    .single();
  if (existing) {
    await supabase
      .from('daily_api_usage')
      .update({
        ebay_calls: (existing.ebay_calls || 0) + success,
        cron_calls: (existing.cron_calls || 0) + success,
        updated_at: new Date().toISOString(),
      })
      .eq('date', today);
  } else {
    await supabase
      .from('daily_api_usage')
      .insert({ date: today, ebay_calls: success, cron_calls: success });
  }

  return NextResponse.json({
    totalCatalogCards: allCards.length,
    processedThisRun: targets.length,
    success,
    errors,
    timestamp: new Date().toISOString(),
  });
}
