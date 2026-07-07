const APIFY_BASE_URL = 'https://api.apify.com/v2';

interface EbaySoldItem {
  price: number;
  recorded_at: string;
  title: string;
  currency: string;
  item_url: string;
}

const USD_TO_JPY = 158;

export async function fetchEbaySoldPrices(query: string): Promise<EbaySoldItem[]> {
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) throw new Error('APIFY_API_TOKEN not set');

  const actorId = 'oTtB3VgfuE9GtxQt2';
  const runUrl = `${APIFY_BASE_URL}/acts/${actorId}/run-sync-get-dataset-items?token=${apiToken}&timeout=50`;

  const res = await fetch(runUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keywords: [query],
      count: 100,
      condition: '',
      categoryId: '0',
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
      // 価格: totalPrice(送料込み) or soldPrice + shippingPrice
      const total = parseFloat(String(item.totalPrice || '0').replace(/[^0-9.]/g, ''));
      let totalPrice: number;
      if (!isNaN(total) && total > 0) {
        totalPrice = total;
      } else {
        const soldPrice = parseFloat(String(item.soldPrice || item.Sold || item.sold || item.price || '0').replace(/[^0-9.]/g, ''));
        if (isNaN(soldPrice) || soldPrice <= 0) return null;
        const shipping = parseFloat(String(item.shippingPrice || item.Shipping || item.shipping || '0').replace(/[^0-9.]/g, ''));
        totalPrice = soldPrice + (isNaN(shipping) ? 0 : shipping);
      }
      if (totalPrice <= 0) return null;

      // 通貨
      const currency = String(item.Currency || item.currency || item.soldCurrency || 'USD');
      const isJPY = currency === 'JPY' || currency.includes('JPY');
      const yenPrice = isJPY ? Math.round(totalPrice) : Math.round(totalPrice * USD_TO_JPY);

      // 日付: "Ended At" フィールド
      const dateStr = item['Ended At'] || item.endedAt || item.soldDate || item.date || '';
      let isoDate: string;
      try {
        const parsed = new Date(String(dateStr));
        isoDate = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
      } catch {
        isoDate = new Date().toISOString();
      }

      // URL
      const itemId = item['Item ID'] || item.itemId || '';
      const itemUrl = itemId ? `https://www.ebay.com/itm/${itemId}` : '';

      return {
        price: yenPrice,
        recorded_at: isoDate,
        title: String(item.Title || item.title || ''),
        currency: isJPY ? 'JPY' : 'USD',
        item_url: itemUrl,
      };
    })
    .filter((item: EbaySoldItem | null): item is EbaySoldItem => item !== null);
}
