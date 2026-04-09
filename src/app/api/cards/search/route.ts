import { NextRequest, NextResponse } from 'next/server';
import { translateCardName } from '@/lib/card-translate';

interface CardSearchResult {
  id: string;
  name: string;
  nameEn: string;
  setName: string;
  number: string;
  imageUrl: string;
  thumbnailUrl: string;
  marketPriceUsd: number | null;
  source: 'pokemon' | 'yugioh' | 'onepiece';
}

const PAGE_SIZE = 10;

// TCGdex API (日本語カード画像対応) + pokemontcg.io フォールバック
async function searchPokemon(rawQuery: string, query: string, page: number): Promise<{ results: CardSearchResult[]; totalCount: number }> {
  const isJapanese = /[ぁ-んァ-ヶ一-龥]/.test(rawQuery);

  // 1. まずTCGdex（日本語対応）で検索
  const lang = isJapanese ? 'ja' : 'en';
  const searchName = isJapanese ? rawQuery : query;
  const tcgdexUrl = `https://api.tcgdex.net/v2/${lang}/cards?name=${encodeURIComponent(searchName)}`;

  const tcgdexRes = await fetch(tcgdexUrl, { next: { revalidate: 3600 } });
  let tcgdexData: { id: string; localId: string; name: string; image?: string }[] = [];
  if (tcgdexRes.ok) {
    const raw = await tcgdexRes.json();
    if (Array.isArray(raw)) tcgdexData = raw.filter((c: { image?: string }) => c.image);
  }

  // 2. TCGdexで結果があればそれを使う
  if (tcgdexData.length > 0) {
    const offset = (page - 1) * PAGE_SIZE;
    const paged = tcgdexData.slice(offset, offset + PAGE_SIZE);
    const results: CardSearchResult[] = paged.map((card) => ({
      id: card.id,
      name: card.name,
      nameEn: card.name,
      setName: card.id.split('-')[0] || '',
      number: card.localId,
      imageUrl: `${card.image}/high.webp`,
      thumbnailUrl: `${card.image}/low.webp`,
      marketPriceUsd: null,
      source: 'pokemon' as const,
    }));
    return { results, totalCount: tcgdexData.length };
  }

  // 3. TCGdexで見つからなければ pokemontcg.io（英語）にフォールバック
  const enQuery = isJapanese ? query : rawQuery;
  const fallbackUrl = `https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(enQuery)}*"&page=${page}&pageSize=${PAGE_SIZE}&select=id,name,set,number,images,tcgplayer`;

  const fallbackRes = await fetch(fallbackUrl, {
    headers: { 'X-Api-Key': process.env.POKEMON_TCG_API_KEY || '' },
    next: { revalidate: 3600 },
  });

  if (!fallbackRes.ok) return { results: [], totalCount: 0 };

  const fallbackData = await fallbackRes.json();
  const results = (fallbackData.data || []).map((card: {
    id: string;
    name: string;
    set: { name: string };
    number: string;
    images: { small: string; large: string };
    tcgplayer?: { prices?: Record<string, { market?: number; mid?: number }> };
  }) => {
    let marketPriceUsd: number | null = null;
    if (card.tcgplayer?.prices) {
      const variants = Object.values(card.tcgplayer.prices);
      for (const v of variants) {
        if (v.market) { marketPriceUsd = v.market; break; }
        if (v.mid) { marketPriceUsd = v.mid; break; }
      }
    }
    return {
      id: card.id,
      name: card.name,
      nameEn: card.name,
      setName: card.set.name,
      number: card.number,
      imageUrl: card.images.large,
      thumbnailUrl: card.images.small,
      marketPriceUsd,
      source: 'pokemon' as const,
    };
  });

  return { results, totalCount: fallbackData.totalCount || 0 };
}

// YGOPRODeck API
async function searchYugioh(query: string, page: number): Promise<{ results: CardSearchResult[]; totalCount: number }> {
  const offset = (page - 1) * PAGE_SIZE;
  const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(query)}&num=${PAGE_SIZE}&offset=${offset}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return { results: [], totalCount: 0 };

  const data = await res.json();
  const results = (data.data || []).map((card: {
    id: number;
    name: string;
    card_images: { image_url: string; image_url_small: string }[];
    card_prices: { tcgplayer_price?: string; cardmarket_price?: string; amazon_price?: string }[];
  }) => {
    const priceStr = card.card_prices?.[0]?.tcgplayer_price || card.card_prices?.[0]?.cardmarket_price;
    const marketPriceUsd = priceStr ? parseFloat(priceStr) : null;
    return {
      id: String(card.id),
      name: card.name,
      nameEn: card.name,
      setName: '',
      number: '',
      imageUrl: card.card_images[0]?.image_url || '',
      thumbnailUrl: card.card_images[0]?.image_url_small || card.card_images[0]?.image_url || '',
      marketPriceUsd: marketPriceUsd && marketPriceUsd > 0 ? marketPriceUsd : null,
      source: 'yugioh' as const,
    };
  });

  return { results, totalCount: data.data?.length === PAGE_SIZE ? offset + PAGE_SIZE + 1 : offset + results.length };
}


// OPTCG API (One Piece)
async function searchOnePiece(query: string, page: number): Promise<{ results: CardSearchResult[]; totalCount: number }> {
  const url = `https://optcgapi.com/api/sets/filtered/?card_name=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return { results: [], totalCount: 0 };

  const data: {
    card_name: string;
    card_set_id: string;
    set_name: string;
    card_image: string;
    card_image_id: string;
    market_price: number | null;
    rarity: string;
  }[] = await res.json();

  if (!Array.isArray(data)) return { results: [], totalCount: 0 };

  // ページネーション（APIがページネーション未対応なのでクライアント側で処理）
  const offset = (page - 1) * PAGE_SIZE;
  const paged = data.slice(offset, offset + PAGE_SIZE);

  // 日本語版画像URLを優先、存在しない場合は英語版にフォールバック
  const results: CardSearchResult[] = await Promise.all(paged.map(async (card, index) => {
    const jaUrl = `https://www.onepiece-cardgame.com/images/cardlist/card/${card.card_image_id}.png`;
    const enUrl = `https://en.onepiece-cardgame.com/images/cardlist/card/${card.card_image_id}.png`;

    // 日本語版の存在をチェック
    let imageUrl = jaUrl;
    try {
      const check = await fetch(jaUrl, { method: 'HEAD' });
      if (!check.ok) imageUrl = enUrl;
    } catch {
      imageUrl = enUrl;
    }

    return {
      id: `${card.card_set_id}_${offset + index}`,
      name: card.card_name,
      nameEn: card.card_name,
      setName: card.set_name,
      number: card.card_set_id,
      imageUrl,
      thumbnailUrl: `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`,
      marketPriceUsd: card.market_price && card.market_price > 0 ? card.market_price : null,
      source: 'onepiece' as const,
    };
  }));

  return { results, totalCount: data.length };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q') || '';
  const source = searchParams.get('source') || 'pokemon';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  if (!rawQuery || rawQuery.length < 2) {
    return NextResponse.json({ results: [], totalCount: 0, page });
  }

  // 日本語なら英語に変換
  const query = translateCardName(rawQuery);

  let data = { results: [] as CardSearchResult[], totalCount: 0 };

  if (source === 'pokemon') {
    data = await searchPokemon(rawQuery, query, page);
  } else if (source === 'yugioh') {
    data = await searchYugioh(query, page);
  } else if (source === 'onepiece') {
    data = await searchOnePiece(query, page);
  }

  return NextResponse.json({ ...data, page });
}
