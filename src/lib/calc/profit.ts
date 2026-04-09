import type { Card } from '@/types/database';

/** 仕入れ原価（カード本体 + 購入時送料）※単価 */
export function getCostBasis(card: Pick<Card, 'purchase_price' | 'purchase_shipping'>): number {
  return card.purchase_price + card.purchase_shipping;
}

/** 総コスト（仕入れ原価 + 鑑定費用）※単価 */
export function getTotalCost(card: Pick<Card, 'purchase_price' | 'purchase_shipping' | 'grading_cost'>): number {
  return getCostBasis(card) + card.grading_cost;
}

/** 想定利益（想定相場 - 総コスト）※単価 */
export function getEstimatedProfit(card: Pick<Card, 'purchase_price' | 'purchase_shipping' | 'grading_cost' | 'estimated_price'>): number {
  return card.estimated_price - getTotalCost(card);
}

/** 実現利益（売却価格 - 総コスト - 手数料）※単価 */
export function getRealizedProfit(card: Pick<Card, 'purchase_price' | 'purchase_shipping' | 'grading_cost' | 'sold_price' | 'platform_fee'>): number | null {
  if (card.sold_price === null) return null;
  return card.sold_price - getTotalCost(card) - card.platform_fee;
}

/** ROI（%） */
export function getROI(card: Pick<Card, 'purchase_price' | 'purchase_shipping' | 'grading_cost' | 'estimated_price'>): number {
  const cost = getTotalCost(card);
  if (cost === 0) return 0;
  return (getEstimatedProfit(card) / cost) * 100;
}

/** 複数カードの合計資産額（数量考慮） */
export function getTotalAssetValue(cards: Pick<Card, 'estimated_price' | 'quantity'>[]): number {
  return cards.reduce((sum, c) => sum + c.estimated_price * c.quantity, 0);
}

/** 複数カードの合計コスト（数量考慮） */
export function getTotalInvestment(cards: Pick<Card, 'purchase_price' | 'purchase_shipping' | 'grading_cost' | 'quantity'>[]): number {
  return cards.reduce((sum, c) => sum + getTotalCost(c) * c.quantity, 0);
}

/** 複数カードの合計想定利益（数量考慮） */
export function getTotalEstimatedProfit(cards: Pick<Card, 'purchase_price' | 'purchase_shipping' | 'grading_cost' | 'estimated_price' | 'quantity'>[]): number {
  return cards.reduce((sum, c) => sum + getEstimatedProfit(c) * c.quantity, 0);
}

/** 金額フォーマット */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

/** 利益の符号付きフォーマット */
export function formatProfit(amount: number): string {
  const prefix = amount > 0 ? '+' : '';
  return prefix + formatCurrency(amount);
}
