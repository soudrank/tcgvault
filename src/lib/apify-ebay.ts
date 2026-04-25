interface EbaySoldItem {
  price: number;
  recorded_at: string;
  title: string;
  currency: string;
}

const USD_TO_JPY = 150;

export async function fetchEbaySoldPrices(query: string): Promise<EbaySoldItem[]> {
  const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1&_sop=13&rt=nc&_ipg=60`;

  const res = await fetch(ebayUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    console.warn('[eBay Sold] Fetch error:', res.status);
    return [];
  }

  const html = await res.text();
  const items: EbaySoldItem[] = [];

  // s-item ブロックを正規表現で抽出
  const itemBlocks = html.split('class="s-item__wrapper');

  for (const block of itemBlocks.slice(1)) { // 最初は空
    // タイトル
    const titleMatch = block.match(/class="s-item__title"[^>]*>(?:<span[^>]*>)?([^<]+)/);
    if (!titleMatch || titleMatch[1].includes('Shop on eBay')) continue;
    const title = titleMatch[1].trim();

    // 価格
    const priceMatch = block.match(/class="s-item__price"[^>]*>(?:<span[^>]*>)?\s*([\$¥]?[\d,]+\.?\d*)/);
    if (!priceMatch) continue;
    const priceText = priceMatch[1];
    const rawPrice = parseFloat(priceText.replace(/[$¥,]/g, ''));
    if (isNaN(rawPrice) || rawPrice <= 0) continue;

    const isJPY = priceText.includes('¥');
    const yenPrice = isJPY ? Math.round(rawPrice) : Math.round(rawPrice * USD_TO_JPY);

    // 日付: "Sold Apr 20, 2025"
    const dateMatch = block.match(/Sold\s+(\w+\s+\d+,?\s*\d{4})/i);
    let isoDate = new Date().toISOString();
    if (dateMatch) {
      try {
        const parsed = new Date(dateMatch[1]);
        if (!isNaN(parsed.getTime())) {
          isoDate = parsed.toISOString();
        }
      } catch { /* use default */ }
    }

    items.push({
      price: yenPrice,
      recorded_at: isoDate,
      title,
      currency: isJPY ? 'JPY' : 'USD',
    });
  }

  return items;
}
