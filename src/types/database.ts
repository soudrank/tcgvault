export type CardTitle = 'pokemon' | 'yugioh' | 'onepiece' | 'digimon' | 'dragonball' | 'duel_masters' | 'other';
export type GradingAgency = 'PSA' | 'BGS' | 'CGC' | 'ARS' | 'Gemix' | 'TAG' | 'none';
export type CardStatus = 'raw' | 'submitted' | 'graded' | 'sold';
export type ExpenseCategory = 'grading' | 'shipping' | 'packaging' | 'other';

export interface Card {
  id: string;
  user_id: string;
  title: CardTitle;
  name: string;
  display_name: string | null;
  image_url: string | null;
  back_image_url: string | null;
  purchase_price: number;
  purchase_shipping: number;
  grading_agency: GradingAgency;
  grade: number | null;
  grading_cost: number;
  cert_number: string | null;
  estimated_price: number;
  sold_price: number | null;
  sold_at: string | null;
  platform_fee: number;
  quantity: number;
  status: CardStatus;
  memo: string | null;
  ebay_linked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  card_id: string | null;
  category: ExpenseCategory;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
}

export interface PriceHistory {
  id: string;
  card_id: string;
  price: number;
  recorded_at: string;
}

export interface PsaPopulation {
  id: string;
  card_id: string;
  total_pop: number;
  grade_breakdown: Record<string, number> | null;
  fetched_at: string;
}

// 表示用ラベル
export const CARD_TITLE_LABELS: Record<CardTitle, string> = {
  pokemon: 'ポケモンカード',
  yugioh: '遊戯王',
  onepiece: 'ワンピース',
  digimon: 'デジモンカード',
  dragonball: 'ドラゴンボール',
  duel_masters: 'デュエマ',
  other: 'その他',
};

export const GRADING_AGENCY_LABELS: Record<GradingAgency, string> = {
  PSA: 'PSA',
  BGS: 'BGS',
  CGC: 'CGC',
  ARS: 'ARS',
  Gemix: 'Gemix',
  TAG: 'TAG',
  none: '未鑑定',
};

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  raw: '未鑑定',
  submitted: '鑑定中',
  graded: '鑑定済',
  sold: '売却済',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  grading: '鑑定費用',
  shipping: '送料',
  packaging: '梱包材',
  other: 'その他',
};
