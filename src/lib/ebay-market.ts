import { fetchEbayPrices } from '@/lib/ebay';
import type { Card } from '@/types/database';

/** eBay出品価格の中央値を返す */
function median(prices: number[]): number {
  if (prices.length === 0) return 0;
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

interface MarketPrice {
  cardId: string;
  marketPrice: number; // eBay中央値（JPY）、取得失敗時は0
}

/** 複数カードのeBay市場価格を並列取得 */
export async function fetchMarketPrices(
  cards: Pick<Card, 'id' | 'name' | 'grade' | 'grading_agency'>[],
): Promise<MarketPrice[]> {
  const results = await Promise.all(
    cards.map(async (card) => {
      try {
        const items = await fetchEbayPrices(card.name, {
          grade: card.grade,
          agency: card.grading_agency !== 'none' ? card.grading_agency : undefined,
        });
        return {
          cardId: card.id,
          marketPrice: median(items.map((i) => i.price)),
        };
      } catch {
        return { cardId: card.id, marketPrice: 0 };
      }
    }),
  );
  return results;
}

/** カード配列にeBay市場価格を適用した総資産額を計算 */
export function calcMarketAssetValue(
  cards: Pick<Card, 'id' | 'estimated_price' | 'quantity'>[],
  marketPrices: MarketPrice[],
): number {
  const priceMap = new Map(marketPrices.map((p) => [p.cardId, p.marketPrice]));
  return cards.reduce((sum, card) => {
    const market = priceMap.get(card.id);
    const price = market && market > 0 ? market : card.estimated_price;
    return sum + price * card.quantity;
  }, 0);
}
