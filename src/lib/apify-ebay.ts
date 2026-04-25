const APIFY_BASE_URL = 'https://api.apify.com/v2';

interface EbaySoldItem {
  price: number;
  recorded_at: string;
  title: string;
  currency: string;
}

const USD_TO_JPY = 158;

export async function fetchEbaySoldPrices(query: string): Promise<EbaySoldItem[]> {
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) throw new Error('APIFY_API_TOKEN not set');

  const actorId = 'caffein.dev~ebay-sold-listings';
  const runUrl = `${APIFY_BASE_URL}/acts/${actorId}/run-sync-get-dataset-items?token=${apiToken}&timeout=60`;

  const res = await fetch(runUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchQuery: query,
      maxResults: 30,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[Apify eBay Sold] Error:', res.status, text.slice(0, 200));
    return [];
  }

  const data = await res.json();
  console.log('[Apify eBay Sold] Raw items:', JSON.stringify(data).slice(0, 500));

  if (!Array.isArray(data)) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data
    .map((item: any) => {
      // 価格を抽出（色々なフィールド名に対応）
      const rawPriceStr = String(item.price || item.soldPrice || item.total || '');
      const priceMatch = rawPriceStr.match(/[\d,.]+/);
      if (!priceMatch) return null;
      const rawPrice = parseFloat(priceMatch[0].replace(/,/g, ''));
      if (isNaN(rawPrice) || rawPrice <= 0) return null;

      const isJPY = rawPriceStr.includes('JPY') || rawPriceStr.includes('¥');
      const yenPrice = isJPY ? Math.round(rawPrice) : Math.round(rawPrice * USD_TO_JPY);

      // 日付
      const dateStr = item.soldDate || item.dateSold || item.date || item.endDate || '';
      let isoDate: string;
      try {
        const cleaned = String(dateStr).replace(/^Sold\s*/i, '').trim();
        const parsed = new Date(cleaned);
        isoDate = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
      } catch {
        isoDate = new Date().toISOString();
      }

      return {
        price: yenPrice,
        recorded_at: isoDate,
        title: item.title || '',
        currency: isJPY ? 'JPY' : 'USD',
      };
    })
    .filter((item: EbaySoldItem | null): item is EbaySoldItem => item !== null);
}
