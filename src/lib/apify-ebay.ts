const APIFY_BASE_URL = 'https://api.apify.com/v2';

interface ApifyEbayItem {
  price: number;
  recorded_at: string;
  title: string;
  currency: string;
}

const USD_TO_JPY = 150;

export async function fetchEbaySoldPrices(query: string): Promise<ApifyEbayItem[]> {
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) throw new Error('APIFY_API_TOKEN not set');

  // Apify の Web Scraper で eBay Sold Listings を取得
  const actorId = 'apify~web-scraper';
  const runUrl = `${APIFY_BASE_URL}/acts/${actorId}/run-sync-get-dataset-items?token=${apiToken}&timeout=30`;

  const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1&_sop=13&rt=nc&_ipg=60`;

  const res = await fetch(runUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startUrls: [{ url: ebayUrl }],
      pageFunction: `async function pageFunction(context) {
        const { jQuery: $ } = context;
        const items = [];
        $('.s-item').each(function() {
          const title = $(this).find('.s-item__title span').text().trim();
          const priceText = $(this).find('.s-item__price').first().text().trim();
          const dateText = $(this).find('.s-item__title--tag .POSITIVE').text().trim()
            || $(this).find('.s-item__ended-date').text().trim();
          if (title && priceText && !title.includes('Shop on eBay')) {
            items.push({ title, priceText, dateText });
          }
        });
        return items;
      }`,
      proxyConfiguration: { useApifyProxy: true },
      maxRequestsPerCrawl: 1,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[Apify] Error:', res.status, text);
    return [];
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  // Web Scraper は pageFunction の結果を配列の配列で返す
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatItems = data.flat();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return flatItems
    .map((item: any) => {
      const priceMatch = String(item.priceText || '').match(/[\d,.]+/);
      if (!priceMatch) return null;
      const rawPrice = parseFloat(priceMatch[0].replace(/,/g, ''));
      if (isNaN(rawPrice) || rawPrice <= 0) return null;

      const isJPY = String(item.priceText).includes('JPY') || String(item.priceText).includes('¥');
      const yenPrice = isJPY ? Math.round(rawPrice) : Math.round(rawPrice * USD_TO_JPY);

      // 日付パース: "Sold Apr 20, 2025" or "Apr 20, 2025" etc.
      let dateStr = String(item.dateText || '').replace(/^Sold\s*/i, '').trim();
      let isoDate: string;
      try {
        const parsed = new Date(dateStr);
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
    .filter((item: ApifyEbayItem | null): item is ApifyEbayItem => item !== null);
}
