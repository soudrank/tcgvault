import { NextRequest, NextResponse } from 'next/server';
import { fetchEbayPrices } from '@/lib/ebay';
import { fetchEbaySoldPrices } from '@/lib/apify-ebay';
import { createAdminClient } from '@/lib/supabase/admin';

const CACHE_TTL_HOURS = 24;

function getToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

async function trackUsage(field: 'ebay_calls' | 'cache_hits') {
  try {
    const supabase = createAdminClient();
    const today = getToday();
    const { data } = await supabase
      .from('daily_api_usage')
      .select('*')
      .eq('date', today)
      .single();
    if (data) {
      await supabase
        .from('daily_api_usage')
        .update({ [field]: (data[field] || 0) + 1, updated_at: new Date().toISOString() })
        .eq('date', today);
    } else {
      await supabase
        .from('daily_api_usage')
        .insert({ date: today, [field]: 1 });
    }
  } catch {
    // Don't block the response
  }
}

async function getCachedResponse(queryKey: string) {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 3600 * 1000).toISOString();
  const { data } = await supabase
    .from('ebay_cache')
    .select('response')
    .eq('query_key', queryKey)
    .gte('created_at', cutoff)
    .single();
  return data?.response ?? null;
}

async function setCachedResponse(queryKey: string, response: unknown) {
  const supabase = createAdminClient();
  await supabase
    .from('ebay_cache')
    .upsert({ query_key: queryKey, response, created_at: new Date().toISOString() });
}

export async function GET(request: NextRequest) {
  const cardName = request.nextUrl.searchParams.get('cardName');
  if (!cardName) {
    return NextResponse.json({ error: 'Missing cardName' }, { status: 400 });
  }

  const source = request.nextUrl.searchParams.get('source');
  const grade = request.nextUrl.searchParams.get('grade');
  const agency = request.nextUrl.searchParams.get('agency');
  const noCache = request.nextUrl.searchParams.get('nocache') === '1';

  // キャッシュキー: 全パラメータを結合
  const cacheKey = [cardName, source, grade, agency].filter(Boolean).join('|').toLowerCase();

  try {
    if (!noCache) {
      const cached = await getCachedResponse(cacheKey);
      if (cached) {
        trackUsage('cache_hits');
        return NextResponse.json(cached, {
          headers: {
            'Cache-Control': 'public, max-age=3600',
            'X-Cache': 'HIT',
          },
        });
      }
    }

    let items;

    if (source === 'apify') {
      // Apify: eBay落札価格
      let query = cardName;
      if (agency && agency !== 'none') query += ` ${agency}`;
      if (grade) query += ` ${grade}`;
      items = await fetchEbaySoldPrices(query);
    } else {
      // デフォルト: Browse API（出品価格）
      items = await fetchEbayPrices(cardName, {
        grade: grade ? Number(grade) : null,
        agency: agency || undefined,
      });
    }

    const responseBody = { items };

    trackUsage('ebay_calls');
    setCachedResponse(cacheKey, responseBody).catch((e) =>
      console.warn('[eBay Cache] Failed to save:', e)
    );

    return NextResponse.json(responseBody, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('[eBay API Route]', error);
    return NextResponse.json({ error: 'Failed to fetch eBay data' }, { status: 500 });
  }
}
