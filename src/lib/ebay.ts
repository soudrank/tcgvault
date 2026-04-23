import { translateCardName } from '@/lib/card-translate';

const TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const BROWSE_API_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search';

interface EbayPriceItem {
  price: number;
  recorded_at: string;
  title: string;
  currency: string;
}

// USD→JPY 簡易レート
const USD_TO_JPY = 150;

function convertToJPY(amount: number, currency: string): number {
  if (currency === 'JPY') return Math.round(amount);
  if (currency === 'USD') return Math.round(amount * USD_TO_JPY);
  return Math.round(amount * USD_TO_JPY);
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
  return items
    .filter((item: any) => item.price)
    .map((item: any) => ({
      price: convertToJPY(parseFloat(item.price?.value || '0'), item.price?.currency || 'USD'),
      recorded_at: item.itemCreationDate || new Date().toISOString(),
      title: item.title || '',
      currency: item.price?.currency || 'USD',
    }))
    .filter((item: EbayPriceItem) => item.price > 0);
}
