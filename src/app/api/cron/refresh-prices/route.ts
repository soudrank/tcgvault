import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchEbayPrices } from '@/lib/ebay';

export const maxDuration = 60;

const BATCH_SIZE = 5;
const DELAY_MS = 2000;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: cards, error } = await supabase
    .from('cards')
    .select('ebay_search_query, grading_agency, grade')
    .eq('ebay_linked', true)
    .not('ebay_search_query', 'is', null);

  if (error || !cards?.length) {
    return NextResponse.json({
      message: 'No ebay-linked cards found',
      error: error?.message,
    });
  }

  // Deduplicate: same cache key = same API call
  const queryMap = new Map<
    string,
    { cardName: string; grade: number | null; agency: string | undefined }
  >();

  for (const card of cards) {
    let q = card.ebay_search_query as string;

    // iOS CardService と同じ変換
    q = q.replace(/Super Alternate Art/gi, 'Manga');
    if (/Manga/i.test(q)) {
      q = q.replace(/Alternate Art/gi, '').replace(/\s{2,}/g, ' ').trim();
    }

    const isGraded = card.grading_agency && card.grading_agency !== 'none';
    let gradeNum: number | null = null;
    let gradeStr: string | null = null;
    let agency: string | undefined = undefined;

    if (isGraded && card.grade) {
      const g = card.grade as number;
      gradeStr = g % 1 === 0 ? String(Math.floor(g)) : String(g);
      const agencyVal = card.grading_agency as string;
      const pattern = new RegExp(`${agencyVal}\\s*\\d`, 'i');
      if (!pattern.test(q)) {
        agency = agencyVal;
        gradeNum = g;
      }
    }

    // /api/ebay/sold-prices と同じキー形式: [cardName, source, grade, agency]
    const cacheKey = [q, gradeStr, agency].filter(Boolean).join('|').toLowerCase();

    if (!queryMap.has(cacheKey)) {
      queryMap.set(cacheKey, { cardName: q, grade: gradeNum, agency });
    }
  }

  const entries = Array.from(queryMap.entries());
  let success = 0;
  let errors = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async ([cacheKey, { cardName, grade, agency }]) => {
        const items = await fetchEbayPrices(cardName, { grade, agency });
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
        console.log(`[Cron] ${r.value.cacheKey}: ${r.value.count} items`);
      } else {
        errors++;
        console.error('[Cron] Failed:', r.reason);
      }
    }

    if (i + BATCH_SIZE < entries.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  // Record cron API calls
  const today = new Date().toISOString().slice(0, 10);
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
    uniqueQueries: entries.length,
    success,
    errors,
    timestamp: new Date().toISOString(),
  });
}
