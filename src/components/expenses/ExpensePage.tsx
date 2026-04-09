'use client';

import { useState, useMemo } from 'react';
import type { Expense, ExpenseCategory } from '@/types/database';
import { EXPENSE_CATEGORY_LABELS } from '@/types/database';
import { createExpense, deleteExpense } from '@/lib/actions/expenses';
import ExpenseForm from './ExpenseForm';
import { Icon } from '@iconify/react';

interface Props {
  initialExpenses: Expense[];
  totalPurchase: number;
  totalSales: number;
}

const CATEGORY_CLASS_MAP: Record<ExpenseCategory, string> = {
  grading: 'cat-grading',
  shipping: 'cat-shipping',
  packaging: 'cat-packaging',
  other: 'cat-other',
};

export default function ExpensePage({ initialExpenses, totalPurchase, totalSales }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  // 月選択
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const prevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };
  const nextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };
  const goToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [expenses, year, month]);

  const totalExpenses = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered]
  );

  const netProfit = totalSales - totalPurchase - totalExpenses;

  const handleAdd = async (data: {
    category: ExpenseCategory;
    amount: number;
    description: string;
    date: string;
  }) => {
    try {
      await createExpense({
        category: data.category,
        amount: data.amount,
        description: data.description || null,
        date: data.date,
      });
      // 楽観的UIで即座に表示
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        user_id: '',
        card_id: null,
        category: data.category,
        amount: data.amount,
        description: data.description || null,
        date: data.date,
        created_at: new Date().toISOString(),
      };
      setExpenses((prev) => [newExpense, ...prev]);
    } catch {
      alert('経費の追加に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この経費を削除しますか？')) return;
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert('削除に失敗しました');
    }
  };

  const fmt = (n: number) => `¥${n.toLocaleString()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Month navigation */}
      <div className="fade fd2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="month-nav-btn" onClick={prevMonth}>
          <Icon icon="mdi:chevron-left" width={16} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e4dc', minWidth: 120, textAlign: 'center' }}>
          {year}年{month}月
        </span>
        <button className="month-nav-btn" onClick={nextMonth}>
          <Icon icon="mdi:chevron-right" width={16} />
        </button>
        <button className="month-nav-btn" onClick={goToday} style={{ marginLeft: 4 }}>
          <Icon icon="mdi:calendar-today" width={14} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="fade fd2 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon icon="mdi:cart-outline" width={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>仕入</span>
          </div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#e8e4dc' }}>
            {fmt(totalPurchase)}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon icon="mdi:receipt-text-outline" width={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>経費</span>
          </div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>
            {fmt(totalExpenses)}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon icon="mdi:cash-plus" width={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>売上</span>
          </div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#e8e4dc' }}>
            {fmt(totalSales)}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon icon="mdi:trending-up" width={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>純利益</span>
          </div>
          <div className="font-display" style={{
            fontSize: 18,
            fontWeight: 700,
            color: netProfit >= 0 ? '#4ade80' : '#f87171',
          }}>
            {fmt(netProfit)}
          </div>
        </div>
      </div>

      {/* 経費入力フォーム */}
      <div className="fade fd3">
        <ExpenseForm onAdd={handleAdd} />
      </div>

      {/* 経費一覧 */}
      <div className="panel fade fd4">
        <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon icon="mdi:receipt-text-check-outline" width={15} style={{ color: 'rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>経費一覧</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', marginLeft: 'auto' }}>
              {filtered.length}件
            </span>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden md:flex" style={{
          padding: '8px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
          fontSize: 10,
          color: 'rgba(255,255,255,0.2)',
          fontWeight: 500,
        }}>
          <span style={{ width: 90 }}>日付</span>
          <span style={{ width: 90 }}>カテゴリ</span>
          <span style={{ flex: 1 }}>メモ</span>
          <span style={{ width: 100, textAlign: 'right' }}>金額</span>
          <span style={{ width: 50 }}></span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            この月の経費はありません
          </div>
        ) : (
          filtered
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => (
              <div key={expense.id}>
                {/* Desktop row */}
                <div className="exp-row hidden md:flex">
                  <span className="font-display" style={{ width: 90, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    {new Date(expense.date).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span style={{ width: 90 }}>
                    <span className={`cat-badge ${CATEGORY_CLASS_MAP[expense.category]}`}>
                      {EXPENSE_CATEGORY_LABELS[expense.category]}
                    </span>
                  </span>
                  <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {expense.description || '-'}
                  </span>
                  <span className="font-display" style={{ width: 100, textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#e8e4dc' }}>
                    {fmt(expense.amount)}
                  </span>
                  <span style={{ width: 50, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="del-btn" onClick={() => handleDelete(expense.id)}>
                      <Icon icon="mdi:trash-can-outline" width={13} />
                    </button>
                  </span>
                </div>

                {/* Mobile card */}
                <div className="md:hidden" style={{
                  padding: '12px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`cat-badge ${CATEGORY_CLASS_MAP[expense.category]}`}>
                        {EXPENSE_CATEGORY_LABELS[expense.category]}
                      </span>
                      <span className="font-display" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                        {new Date(expense.date).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <button className="del-btn" onClick={() => handleDelete(expense.id)}>
                      <Icon icon="mdi:trash-can-outline" width={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                      {expense.description || '-'}
                    </span>
                    <span className="font-display" style={{ fontSize: 14, fontWeight: 600, color: '#e8e4dc' }}>
                      {fmt(expense.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
