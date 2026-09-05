import { translateCardName } from '@/lib/card-translate';

const TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const BROWSE_API_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search';

interface EbayPriceItem {
  price: number;
  recorded_at: string;
  title: string;
  currency: string;
  item_url: string;
  image_url: string | null;
}

// 為替レートキャッシュ（1時間）
let rateCache: { rates: Record<string, number>; expiresAt: number } | null = null;

async function getExchangeRates(): Promise<Record<string, number>> {
  if (rateCache && Date.now() < rateCache.expiresAt) {
    return rateCache.rates;
  }
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
    if (res.ok) {
      const data = await res.json();
      // data.rates は JPY基準 (例: USD=0.0094 → 1JPY=0.0094USD → 1USD=106JPY)
      const rates: Record<string, number> = {};
      for (const [cur, rate] of Object.entries(data.rates as Record<string, number>)) {
        rates[cur] = 1 / rate; // 各通貨→JPYのレート
      }
      rates['JPY'] = 1;
      rateCache = { rates, expiresAt: Date.now() + 3600 * 1000 };
      return rates;
    }
  } catch (e) {
    console.warn('[FX] Failed to fetch rates:', e);
  }
  // フォールバック（2024年末〜2026年の概算レート）
  return { USD: 158, EUR: 170, GBP: 198, AUD: 100, CAD: 112, JPY: 1 };
}

async function convertToJPY(amount: number, currency: string): Promise<number> {
  if (currency === 'JPY') return Math.round(amount);
  const rates = await getExchangeRates();
  const rate = rates[currency] || rates['USD'] || 158;
  return Math.round(amount * rate);
}

// OAuthトークンをキャッシュ
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('eBay credentials not set');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  });

  if (!res.ok) {
    console.warn('[eBay] Token error:', res.status);
    throw new Error('Failed to get eBay token');
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

export async function fetchEbayPrices(
  cardName: string,
  options?: { grade?: number | null; agency?: string },
): Promise<EbayPriceItem[]> {
  const token = await getAccessToken();

  let query = translateCardName(cardName);
  if (options?.agency && options.agency !== 'none') {
    query += ` ${options.agency}`;
  }
  if (options?.grade) {
    query += ` ${options.grade}`;
  }

  const params = new URLSearchParams({
    q: query,
    limit: '30',
    category_ids: '183454',
    filter: 'buyingOptions:{FIXED_PRICE}',
    sort: 'newlyListed',
  });

  const res = await fetch(`${BROWSE_API_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      'X-EBAY-C-ENDUSERCTX': 'affiliateCampaignId=5339202300,affiliateReferenceId=trebase',
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.warn('[eBay] Browse API error:', res.status);
    return [];
  }

  const data = await res.json();
  const items = data.itemSummaries;
  if (!items || !Array.isArray(items)) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = items.filter((item: any) => item.price);
  // itemIdで重複排除
  const seen = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unique = filtered.filter((item: any) => {
    const id = item.itemId || item.legacyItemId || item.title;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  // itemCreationDateがないアイテムは除外（偽の日付でグラフを汚さない）
  const withDate = unique.filter((item: any) => item.itemCreationDate);
  const mapped = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    withDate.map(async (item: any) => ({
      price: await convertToJPY(parseFloat(item.price?.value || '0'), item.price?.currency || 'USD'),
      recorded_at: item.itemCreationDate,
      title: item.title || '',
      currency: item.price?.currency || 'USD',
      item_url: item.itemAffiliateWebUrl || item.itemWebUrl || '',
      image_url: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || null,
    })),
  );
  return mapped.filter((item: EbayPriceItem) => item.price > 0);
}
