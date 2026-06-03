import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const h24ago = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();

  // API usage (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
    .toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  const { data: usageData } = await supabase
    .from('daily_api_usage')
    .select('*')
    .gte('date', sevenDaysAgo)
    .order('date', { ascending: false });

  const today = now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  const todayUsage = usageData?.find((d) => d.date === today);

  // Cache stats
  const { count: totalCache } = await supabase
    .from('ebay_cache')
    .select('*', { count: 'exact', head: true });

  const { count: freshCache } = await supabase
    .from('ebay_cache')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', h24ago);

  // Latest cache entries
  const { data: recentEntries } = await supabase
    .from('ebay_cache')
    .select('query_key, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  // Cards stats
  const { count: totalCards } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true });

  const { count: linkedCards } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('ebay_linked', true);

  const { data: queries } = await supabase
    .from('cards')
    .select('ebay_search_query')
    .eq('ebay_linked', true)
    .not('ebay_search_query', 'is', null);
  const uniqueQueries = new Set(queries?.map((q) => q.ebay_search_query)).size;

  // Users
  const { data: userRows } = await supabase.from('cards').select('user_id');
  const distinctUserCount = new Set(userRows?.map((r) => r.user_id)).size;

  return NextResponse.json({
    today: {
      date: today,
      ebayApiCalls: todayUsage?.ebay_calls ?? 0,
      cacheHits: todayUsage?.cache_hits ?? 0,
      cronCalls: todayUsage?.cron_calls ?? 0,
      limit: 5000,
      remaining: 5000 - (todayUsage?.ebay_calls ?? 0),
    },
    last7days: usageData?.map((d) => ({
      date: d.date,
      ebayApiCalls: d.ebay_calls,
      cacheHits: d.cache_hits,
      cronCalls: d.cron_calls,
    })),
    cache: {
      total: totalCache ?? 0,
      fresh24h: freshCache ?? 0,
    },
    cards: {
      total: totalCards ?? 0,
      ebayLinked: linkedCards ?? 0,
      uniqueQueries,
    },
    users: distinctUserCount,
    recentCacheUpdates: recentEntries?.map((e) => ({
      query: e.query_key,
      updatedAt: e.created_at,
    })),
    serverTime: now.toISOString(),
  });
}
