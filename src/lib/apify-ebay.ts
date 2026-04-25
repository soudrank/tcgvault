const APIFY_BASE_URL = 'https://api.apify.com/v2';

interface ApifyEbayItem {
  price: number;
  recorded_at: string;
  title: string;
  currency: string;
}

// USD→JPY 簡易レート
const USD_TO_JPY = 150;

export async function fetchEbaySoldPrices(query: string): Promise<ApifyEbayItem[]> {
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) throw new Error('APIFY_API_TOKEN not set');

  // epctex/ebay-scraper Actor を同期実行
  const actorId = 'epctex~ebay-scraper';
  const runUrl = `${APIFY_BASE_URL}/acts/${actorId}/run-sync-get-dataset-items?token=${apiToken}`;

  const res = await fetch(runUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keyword: query,
      categoryId: '183454', // Trading Cards
      maxItems: 30,
      searchType: 'sold', // Sold Items のみ
    }),
  });

  if (!res.ok) {
    console.warn('[Apify] Error:', res.status, await res.text().catch(() => ''));
    return [];
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data
    .filter((item: any) => item.price)
    .map((item: any) => {
      const currency = item.currency || 'USD';
      const rawPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '') || '0');
      const yenPrice = currency === 'JPY' ? Math.round(rawPrice) : Math.round(rawPrice * USD_TO_JPY);
      return {
        price: yenPrice,
        recorded_at: item.soldDate || item.date || new Date().toISOString(),
        title: item.title || '',
        currency,
      };
    })
    .filter((item: ApifyEbayItem) => item.price > 0);
}
