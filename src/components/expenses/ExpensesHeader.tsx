'use client';

import { Icon } from '@iconify/react';

export function ExpensesHeader() {
  return (
    <div className="fade fd1" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Icon icon="mdi:receipt-text-outline" width={18} style={{ color: '#e8b830' }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
          Expenses
        </span>
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e8e4dc' }}>経費管理</h1>
    </div>
  );
}
