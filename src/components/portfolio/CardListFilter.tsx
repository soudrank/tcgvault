'use client';

import { useState } from 'react';
import type { CardTitle, CardStatus } from '@/types/database';
import { CARD_TITLE_LABELS, CARD_STATUS_LABELS } from '@/types/database';
import { Icon } from '@iconify/react';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  titleFilter: CardTitle | 'all';
  onTitleFilterChange: (value: CardTitle | 'all') => void;
  statusFilter: CardStatus | 'all';
  onStatusFilterChange: (value: CardStatus | 'all') => void;
  sortBy: 'newest' | 'profit' | 'value';
  onSortChange: (value: 'newest' | 'profit' | 'value') => void;
}

export default function CardListFilter({
  search,
  onSearchChange,
  titleFilter,
  onTitleFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleReset = () => {
    onSearchChange('');
    onTitleFilterChange('all');
    onStatusFilterChange('all');
    onSortChange('newest');
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop filters */}
      <div className="hidden md:flex items-center gap-3 mb-4 fade fd1">
        <div className="relative flex-shrink-0" style={{ width: 220 }}>
          <Icon
            icon="mdi:magnify"
            width={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/15"
          />
          <input
            type="text"
            className="f-search"
            placeholder="カード名で検索..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          value={titleFilter}
          onChange={(e) => onTitleFilterChange(e.target.value as CardTitle | 'all')}
          className="f-select"
        >
          <option value="all">すべてのタイトル</option>
          {(Object.entries(CARD_TITLE_LABELS) as [CardTitle, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as CardStatus | 'all')}
          className="f-select"
        >
          <option value="all">すべての状態</option>
          {(Object.entries(CARD_STATUS_LABELS) as [CardStatus, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'newest' | 'profit' | 'value')}
          className="f-select"
        >
          <option value="newest">新しい順</option>
          <option value="profit">利益順</option>
          <option value="value">資産額順</option>
        </select>
      </div>

      {/* Mobile: search + filter button */}
      <div className="md:hidden mb-4 fade fd1">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon
              icon="mdi:magnify"
              width={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/15"
            />
            <input
              type="text"
              className="f-search"
              placeholder="カード名で検索..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button
            className="btn-edit"
            style={{ width: 34, height: 34, borderRadius: 8 }}
            onClick={() => setDrawerOpen(true)}
            title="絞り込み"
          >
            <Icon icon="mdi:filter-variant" width={16} />
          </button>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div
        className={`filter-drawer md:hidden ${drawerOpen ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDrawerOpen(false);
        }}
      >
        <div className="filter-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="w-10 h-1 rounded-full bg-white-10 mx-auto mb-5" />
          <div className="text-xs font-medium text-white/50 mb-4">絞り込み</div>
          <div className="space-y-3">
            <select
              value={titleFilter}
              onChange={(e) => onTitleFilterChange(e.target.value as CardTitle | 'all')}
              className="f-select w-full"
            >
              <option value="all">すべてのタイトル</option>
              {(Object.entries(CARD_TITLE_LABELS) as [CardTitle, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as CardStatus | 'all')}
              className="f-select w-full"
            >
              <option value="all">すべての状態</option>
              {(Object.entries(CARD_STATUS_LABELS) as [CardStatus, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'newest' | 'profit' | 'value')}
              className="f-select w-full"
            >
              <option value="newest">新しい順</option>
              <option value="profit">利益順</option>
              <option value="value">資産額順</option>
            </select>

            <button
              className="w-full py-2.5 text-xs text-white/40 border border-white/[0.08] rounded-lg mt-2 hover:text-white/60 transition-colors"
              onClick={handleReset}
            >
              リセット
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
