'use client';

import { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import type { Card, Expense } from '@/types/database';
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from '@/types/database';
import { getCostBasis, getTotalCost } from '@/lib/calc/profit';
import { generateCardsCsv, generateExpensesCsv, generateFreeeCsv } from '@/lib/csv/export';

function fmtYen(n: number): string {
  return '¥' + Math.abs(n).toLocaleString();
}

interface Props {
  cards: Card[];
  expenses: Expense[];
}

export default function AnnualReport({ cards, expenses }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  // 年度でフィルタ
  const yearCards = useMemo(
    () => cards.filter((c) => new Date(c.created_at).getFullYear() === year),
    [cards, year]
  );

  const soldCards = useMemo(
    () =>
      cards.filter(
        (c) => c.sold_price !== null && c.sold_at && new Date(c.sold_at).getFullYear() === year
      ),
    [cards, year]
  );

  const yearExpenses = useMemo(
    () => expenses.filter((e) => new Date(e.date).getFullYear() === year),
    [expenses, year]
  );

  // 集計
  const totalSales = soldCards.reduce((sum, c) => sum + (c.sold_price ?? 0), 0);
  const totalPlatformFee = soldCards.reduce((sum, c) => sum + c.platform_fee, 0);
  const netSales = totalSales - totalPlatformFee;
  const totalPurchase = yearCards.reduce((sum, c) => sum + getCostBasis(c), 0);
  const totalGradingCost = yearCards.reduce((sum, c) => sum + c.grading_cost, 0);

  // 経費カテゴリ別集計
  const expenseByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    yearExpenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return map;
  }, [yearExpenses]);

  const totalExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = netSales - totalPurchase - totalGradingCost - totalExpenses;

  // CSV ダウンロード
  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const netIncomeColor = netIncome > 0
    ? 'positive'
    : netIncome < 0
      ? 'negative'
      : '';

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header + Year Nav */}
      <div className="mb-6 fade" style={{ marginTop: 8 }}>
        <div className="flex items-center gap-2 mb-1">
          <Icon icon="mdi:file-chart-outline" width={16} className="text-white/12" />
          <span className="text-[10px] text-white/18 tracking-wider uppercase font-display">
            Annual Report
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="font-bold text-xl md:text-2xl tracking-tight text-white/85">
            {year}年 年間収支レポート
          </h1>
          <div className="flex items-center gap-2">
            <button className="month-nav-btn" onClick={() => setYear(year - 1)}>
              <Icon icon="mdi:chevron-left" width={18} />
            </button>
            <button
              className="month-nav-btn"
              style={{ width: 'auto', padding: '0 12px', fontSize: 10, gap: 4, display: 'flex' }}
              onClick={() => setYear(currentYear)}
            >
              <Icon icon="mdi:calendar-today" width={13} />
              今年
            </button>
            <button
              className="month-nav-btn"
              onClick={() => setYear(year + 1)}
              disabled={year >= currentYear}
              style={year >= currentYear ? { opacity: 0.3, pointerEvents: 'none' } : undefined}
            >
              <Icon icon="mdi:chevron-right" width={18} />
            </button>
          </div>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="panel mb-6 fade fd1">
        <div className="px-5 py-3.5 border-b border-white/[0.04]">
          <div className="text-[11px] font-medium text-white/45">損益計算書</div>
        </div>

        {/* 売上 */}
        <div className="pl-section">売上</div>
        <div className="pl-row">
          <div className="pl-label">
            売上合計<span className="pl-sub">&mdash; {soldCards.length}枚売却</span>
          </div>
          <div className="pl-val font-display">{fmtYen(totalSales)}</div>
        </div>
        <div className="pl-row indent">
          <div className="pl-label">うちプラットフォーム手数料</div>
          <div className="pl-val negative font-display">-{fmtYen(totalPlatformFee)}</div>
        </div>
        <div className="pl-row" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="pl-label" style={{ fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>
            売上（手数料差引後）
          </div>
          <div className="pl-val positive font-display">{fmtYen(netSales)}</div>
        </div>

        {/* 原価・経費 */}
        <div className="pl-section">原価・経費</div>
        <div className="pl-row">
          <div className="pl-label">
            仕入合計<span className="pl-sub">&mdash; {yearCards.length}枚</span>
          </div>
          <div className="pl-val negative font-display">-{fmtYen(totalPurchase)}</div>
        </div>
        <div className="pl-row">
          <div className="pl-label">鑑定費用合計</div>
          <div className="pl-val negative font-display">-{fmtYen(totalGradingCost)}</div>
        </div>
        <div className="pl-row" style={{ paddingBottom: 4 }}>
          <div className="pl-label">その他経費合計</div>
          <div className="pl-val negative font-display">-{fmtYen(totalExpenses)}</div>
        </div>
        {/* Sub-breakdown */}
        {(['grading', 'shipping', 'packaging', 'other'] as ExpenseCategory[]).map((cat) => {
          const amount = expenseByCategory.get(cat) || 0;
          return (
            <div key={cat} className="pl-row indent">
              <div className="pl-label" style={{ fontSize: 11 }}>
                {'\u3000'}{EXPENSE_CATEGORY_LABELS[cat]}
              </div>
              <div className="pl-val negative font-display" style={{ fontSize: 11, opacity: 0.7 }}>
                -{fmtYen(amount)}
              </div>
            </div>
          );
        })}

        {/* Net Income */}
        <div className="pl-total">
          <div className="pl-label">所得（利益）</div>
          <div className={`pl-val ${netIncomeColor} font-display`}>
            {netIncome < 0 ? '-' : ''}{fmtYen(netIncome)}
          </div>
        </div>
        <div className="pl-formula font-display">
          = {fmtYen(netSales)} − {fmtYen(totalPurchase)} − {fmtYen(totalGradingCost)} − {fmtYen(totalExpenses)}
        </div>
      </div>

      {/* Tax Guidance */}
      <div className="tax-box mb-6 fade fd2">
        <div className="tax-title">
          <Icon icon="mdi:information-outline" width={15} />
          確定申告のポイント
        </div>
        <div className="tax-item">
          <div className="tax-dot" />
          <div>
            雑所得が年間<strong className="text-white/50">20万円</strong>を超える場合、確定申告が必要です（給与所得者の場合）
          </div>
        </div>
        <div className="tax-item">
          <div className="tax-dot" />
          <div>確定申告書B 第一表の「雑所得」欄に所得金額を記入します</div>
        </div>
        <div className="tax-item">
          <div className="tax-dot" />
          <div>収支内訳書（雑所得用）に、売上・仕入・経費の内訳を記載します</div>
        </div>
        <div className="tax-item">
          <div className="tax-dot" />
          <div>
            下記CSVを<strong className="text-white/50">freee</strong>や
            <strong className="text-white/50">MoneyForward</strong>にインポートすることで、仕訳の自動作成が可能です
          </div>
        </div>
        <div className="tax-item">
          <div className="tax-dot" />
          <div>領収書・取引明細は5年間保管義務があります。取引明細CSVを保存しておくことを推奨します</div>
        </div>
      </div>

      {/* CSV Export */}
      <div className="mb-6 fade fd3">
        <div className="text-[11px] font-medium text-white/40 mb-3 flex items-center gap-2">
          <Icon icon="mdi:download-outline" width={14} style={{ opacity: 0.5 }} />
          CSVエクスポート
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            className="csv-btn"
            onClick={() => downloadCsv(generateCardsCsv(yearCards), `trecaru_取引明細_${year}.csv`)}
          >
            <div
              className="csv-icon"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)' }}
            >
              <Icon icon="mdi:file-delimited" width={16} className="text-blue-400/70" />
            </div>
            <div>
              <div className="csv-title">取引明細CSV</div>
              <div className="csv-desc">購入記録・証拠書類用</div>
            </div>
          </button>
          <button
            className="csv-btn"
            onClick={() => downloadCsv(generateExpensesCsv(yearExpenses), `trecaru_経費明細_${year}.csv`)}
          >
            <div
              className="csv-icon"
              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.12)' }}
            >
              <Icon icon="mdi:receipt-text-outline" width={16} className="text-purple-400/70" />
            </div>
            <div>
              <div className="csv-title">経費明細CSV</div>
              <div className="csv-desc">経費のみ抽出</div>
            </div>
          </button>
          <button
            className="csv-btn"
            onClick={() => downloadCsv(generateFreeeCsv(cards, expenses, year), `trecaru_仕訳_freee_${year}.csv`)}
          >
            <div
              className="csv-icon"
              style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.12)' }}
            >
              <Icon icon="mdi:swap-horizontal-circle-outline" width={16} className="text-amber-500/70" />
            </div>
            <div>
              <div className="csv-title">freee互換 仕訳CSV</div>
              <div className="csv-desc">会計ソフト直インポート</div>
            </div>
          </button>
        </div>
      </div>

      {/* Sold Cards Table */}
      <div className="panel fade fd4">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
          <div className="text-[11px] font-medium text-white/45">売却カード一覧</div>
          <div className="text-[10px] text-white/18 font-display">{soldCards.length}枚</div>
        </div>

        {soldCards.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>売却日</th>
                    <th>カード名</th>
                    <th className="text-right">仕入原価</th>
                    <th className="text-right">売却価格</th>
                    <th className="text-right">手数料</th>
                    <th className="text-right">実現利益</th>
                  </tr>
                </thead>
                <tbody>
                  {soldCards.map((c) => {
                    const cost = getTotalCost(c);
                    const profit = (c.sold_price ?? 0) - c.platform_fee - cost;
                    return (
                      <tr key={c.id}>
                        <td className="text-white/30 font-display">{c.sold_at?.slice(0, 10)}</td>
                        <td className="text-white/60 font-medium">{c.name}</td>
                        <td className="text-right text-white/40 font-display">{fmtYen(cost)}</td>
                        <td className="text-right text-white/60 font-display">{fmtYen(c.sold_price ?? 0)}</td>
                        <td className="text-right text-white/25 font-display">-{fmtYen(c.platform_fee)}</td>
                        <td
                          className={`text-right font-medium font-display ${profit >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}
                        >
                          {profit < 0 ? '-' : '+'}{fmtYen(profit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-white/[0.03]">
              {soldCards.map((c) => {
                const cost = getTotalCost(c);
                const profit = (c.sold_price ?? 0) - c.platform_fee - cost;
                return (
                  <div key={c.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-white/25 font-display">
                        {c.sold_at?.slice(0, 10)}
                      </span>
                      <span
                        className={`text-[13px] font-semibold font-display ${profit >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}
                      >
                        {profit < 0 ? '-' : '+'}{fmtYen(profit)}
                      </span>
                    </div>
                    <div className="text-[12px] text-white/55 font-medium mb-1">{c.name}</div>
                    <div className="flex items-center gap-3 text-[10px] text-white/20 font-display">
                      <span>原価 {fmtYen(cost)}</span>
                      <span>売却 {fmtYen(c.sold_price ?? 0)}</span>
                      <span>手数料 -{fmtYen(c.platform_fee)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-14 text-center">
            <Icon icon="mdi:cash-remove" width={40} className="text-white/6 mx-auto mb-3" />
            <div className="text-xs text-white/18">この年の売却記録はありません</div>
          </div>
        )}
      </div>

      <div className="h-10" />
    </div>
  );
}
