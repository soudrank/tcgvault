import type { Card, Expense } from '@/types/database';
import { CARD_TITLE_LABELS, CARD_STATUS_LABELS, EXPENSE_CATEGORY_LABELS } from '@/types/database';
import { getCostBasis, getTotalCost } from '@/lib/calc/profit';

/** 取引明細CSV（仕入台帳） */
export function generateCardsCsv(cards: Card[]): string {
  const headers = [
    '登録日',
    'カード名',
    'タイトル',
    'ステータス',
    'カード本体価格',
    '購入時送料',
    '仕入原価',
    '鑑定機関',
    'グレード',
    '鑑定費用',
    '総コスト',
    '想定相場',
    '売却価格',
    'プラットフォーム手数料',
    '手取り',
    '売却日',
    'メモ',
  ];

  const rows = cards.map((c) => {
    const costBasis = getCostBasis(c);
    const totalCost = getTotalCost(c);
    const netSale = c.sold_price !== null ? c.sold_price - c.platform_fee : '';
    return [
      c.created_at.slice(0, 10),
      c.name,
      CARD_TITLE_LABELS[c.title],
      CARD_STATUS_LABELS[c.status],
      c.purchase_price,
      c.purchase_shipping,
      costBasis,
      c.grading_agency === 'none' ? '' : c.grading_agency,
      c.grade ?? '',
      c.grading_cost,
      totalCost,
      c.estimated_price,
      c.sold_price ?? '',
      c.platform_fee || '',
      netSale,
      c.sold_at?.slice(0, 10) ?? '',
      c.memo ?? '',
    ];
  });

  return toCsvString(headers, rows);
}

/** 経費明細CSV */
export function generateExpensesCsv(expenses: Expense[]): string {
  const headers = ['日付', 'カテゴリ', '金額', 'メモ'];

  const rows = expenses.map((e) => [
    e.date,
    EXPENSE_CATEGORY_LABELS[e.category],
    e.amount,
    e.description ?? '',
  ]);

  return toCsvString(headers, rows);
}

/** freee 互換の仕訳CSV */
export function generateFreeeCsv(cards: Card[], expenses: Expense[], year: number): string {
  const headers = [
    '取引日',
    '勘定科目',
    '税区分',
    '金額',
    '取引先',
    '品目',
    '備考',
  ];

  const rows: (string | number)[][] = [];

  // 仕入の仕訳
  cards
    .filter((c) => new Date(c.created_at).getFullYear() === year)
    .forEach((c) => {
      rows.push([
        c.created_at.slice(0, 10),
        '仕入高',
        '対象外',
        getCostBasis(c),
        '',
        c.name,
        `${CARD_TITLE_LABELS[c.title]}`,
      ]);
    });

  // 売上の仕訳
  cards
    .filter((c) => c.sold_price !== null && c.sold_at && new Date(c.sold_at).getFullYear() === year)
    .forEach((c) => {
      rows.push([
        c.sold_at!.slice(0, 10),
        '売上高',
        '対象外',
        c.sold_price!,
        '',
        c.name,
        '',
      ]);
      if (c.platform_fee > 0) {
        rows.push([
          c.sold_at!.slice(0, 10),
          '支払手数料',
          '対象外',
          c.platform_fee,
          '',
          c.name,
          'プラットフォーム手数料',
        ]);
      }
    });

  // 経費の仕訳
  expenses
    .filter((e) => new Date(e.date).getFullYear() === year)
    .forEach((e) => {
      const accountMap: Record<string, string> = {
        grading: '外注工賃',
        shipping: '荷造運賃',
        packaging: '消耗品費',
        other: '雑費',
      };
      rows.push([
        e.date,
        accountMap[e.category] || '雑費',
        '対象外',
        e.amount,
        '',
        '',
        e.description ?? '',
      ]);
    });

  // 日付順でソート
  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  return toCsvString(headers, rows);
}

function toCsvString(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ];

  return '\ufeff' + lines.join('\n'); // BOM付きでExcel対応
}
