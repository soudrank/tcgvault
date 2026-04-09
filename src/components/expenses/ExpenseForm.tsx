'use client';

import { useState } from 'react';
import type { ExpenseCategory } from '@/types/database';
import { EXPENSE_CATEGORY_LABELS } from '@/types/database';
import { Icon } from '@iconify/react';

interface Props {
  onAdd: (expense: {
    category: ExpenseCategory;
    amount: number;
    description: string;
    date: string;
  }) => void;
}

export default function ExpenseForm({ onAdd }: Props) {
  const [category, setCategory] = useState<ExpenseCategory>('shipping');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onAdd({ category, amount, description, date });
    setAmount(0);
    setDescription('');
  };

  return (
    <div className="panel">
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon icon="mdi:plus" width={15} style={{ color: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>経費を追加</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 14 }}>
          <div>
            <label className="field-label">カテゴリ</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="fi fi-select"
            >
              {(Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]).map(
                ([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="field-label">金額</label>
            <input
              type="number"
              min={1}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              placeholder="0"
              className="fi font-display"
            />
          </div>
          <div>
            <label className="field-label">メモ</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="内容を入力..."
              className="fi"
            />
          </div>
          <div>
            <label className="field-label">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="fi font-display"
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-add" disabled={amount <= 0}>
            <Icon icon="mdi:plus" width={14} />
            追加
          </button>
        </div>
      </form>
    </div>
  );
}
