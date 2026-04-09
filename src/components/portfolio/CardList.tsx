'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Card, CardTitle, CardStatus } from '@/types/database';
import { CARD_TITLE_LABELS, CARD_STATUS_LABELS, GRADING_AGENCY_LABELS } from '@/types/database';
import { getEstimatedProfit, formatCurrency, formatProfit } from '@/lib/calc/profit';
import { updateCardQuantity } from '@/lib/actions/cards';
import CardListFilter from './CardListFilter';
import CardGridView from './CardGridView';
import { Icon } from '@iconify/react';

const TITLE_THUMB_COLORS: Record<string, string> = {
  pokemon: 'rgba(250,204,21,0.12)',
  yugioh: 'rgba(168,85,247,0.12)',
  onepiece: 'rgba(239,68,68,0.12)',
  digimon: 'rgba(59,130,246,0.12)',
  dragonball: 'rgba(249,115,22,0.12)',
  duel_masters: 'rgba(34,197,94,0.12)',
  other: 'rgba(255,255,255,0.06)',
};

const TITLE_THUMB_BORDERS: Record<string, string> = {
  pokemon: 'rgba(250,204,21,0.15)',
  yugioh: 'rgba(168,85,247,0.15)',
  onepiece: 'rgba(239,68,68,0.15)',
  digimon: 'rgba(59,130,246,0.15)',
  dragonball: 'rgba(249,115,22,0.15)',
  duel_masters: 'rgba(34,197,94,0.15)',
  other: 'rgba(255,255,255,0.08)',
};

const TITLE_DOT_COLORS: Record<string, string> = {
  pokemon: '#facc15',
  yugioh: '#a855f7',
  onepiece: '#ef4444',
  digimon: '#3b82f6',
  dragonball: '#f97316',
  duel_masters: '#22c55e',
  other: '#6b7280',
};

const TITLE_ICONS: Record<string, string> = {
  pokemon: 'mdi:lightning-bolt',
  yugioh: 'mdi:sword-cross',
  onepiece: 'mdi:pirate',
  digimon: 'mdi:dna',
  dragonball: 'mdi:fire',
  duel_masters: 'mdi:shield-sword-outline',
  other: 'mdi:card-outline',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  raw: 'badge-raw',
  submitted: 'badge-submitted',
  graded: 'badge-graded',
  sold: 'badge-sold',
};

interface Props {
  cards: Card[];
}

export default function CardList({ cards }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get('title') as CardTitle | null;
  const initialSort = searchParams.get('sort') as 'newest' | 'profit' | 'value' | null;
  const initialView = searchParams.get('view') as 'list' | 'grid' | null;
  const sourceFilter = searchParams.get('source');
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [titleFilter, setTitleFilter] = useState<CardTitle | 'all'>(initialTitle ?? 'all');
  const [statusFilter, setStatusFilter] = useState<CardStatus | 'all'>('all');
  const [sortBy, setSortByState] = useState<'newest' | 'profit' | 'value'>(initialSort ?? 'newest');
  const [viewMode, setViewModeState] = useState<'list' | 'grid'>(initialView ?? 'grid');

  const setViewMode = (value: 'list' | 'grid') => {
    setViewModeState(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'list') {
      params.delete('view');
    } else {
      params.set('view', value);
    }
    router.replace(`/portfolio?${params.toString()}`, { scroll: false });
  };

  const setSortBy = (value: 'newest' | 'profit' | 'value') => {
    setSortByState(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    router.replace(`/portfolio?${params.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    let result = cards;

    if (sourceFilter === 'ebay') {
      result = result.filter((c) => c.ebay_linked);
    } else if (sourceFilter === 'manual') {
      result = result.filter((c) => !c.ebay_linked);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (titleFilter !== 'all') {
      result = result.filter((c) => c.title === titleFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'profit') return getEstimatedProfit(b) - getEstimatedProfit(a);
      if (sortBy === 'value') return b.estimated_price - a.estimated_price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [cards, search, titleFilter, statusFilter, sortBy, sourceFilter]);

  const totalQuantity = filtered.reduce((sum, c) => sum + c.quantity, 0);

  const handleQuantity = (e: React.MouseEvent, cardId: string, delta: number) => {
    e.stopPropagation();
    startTransition(async () => {
      await updateCardQuantity(cardId, delta);
      router.refresh();
    });
  };

  const thumbBg = (title: string) => TITLE_THUMB_COLORS[title] || TITLE_THUMB_COLORS.other;
  const thumbBorder = (title: string) => TITLE_THUMB_BORDERS[title] || TITLE_THUMB_BORDERS.other;
  const dotColor = (title: string) => TITLE_DOT_COLORS[title] || TITLE_DOT_COLORS.other;
  const titleIcon = (title: string) => TITLE_ICONS[title] || TITLE_ICONS.other;

  const statusBadge = (status: CardStatus) => {
    const cls = STATUS_BADGE_CLASS[status] || 'badge-raw';
    return (
      <span className={`badge ${cls}`}>
        {status === 'submitted' && (
          <span className="w-1 h-1 rounded-full bg-[#e8b830] animate-pulse" />
        )}
        {CARD_STATUS_LABELS[status]}
      </span>
    );
  };

  const gradingText = (card: Card) =>
    card.grading_agency !== 'none'
      ? `${GRADING_AGENCY_LABELS[card.grading_agency]} ${card.grade ?? '未設定'}`
      : '未鑑定';

  return (
    <div>
      <CardListFilter
        search={search}
        onSearchChange={setSearch}
        titleFilter={titleFilter}
        onTitleFilterChange={setTitleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Source filter badge */}
      {(sourceFilter === 'ebay' || sourceFilter === 'manual') && (
        <div className="flex items-center gap-2 mb-3">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
            style={sourceFilter === 'ebay'
              ? { background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }
              : { background: 'rgba(232,184,48,0.12)', color: '#e8b830', border: '1px solid rgba(232,184,48,0.2)' }}
          >
            <Icon icon={sourceFilter === 'ebay' ? 'mdi:store' : 'mdi:pencil'} width={14} />
            {sourceFilter === 'ebay' ? 'eBay連携カードのみ' : '手動設定カードのみ'}
            <button
              onClick={() => router.replace('/portfolio', { scroll: false })}
              className="ml-1 rounded-full p-0.5 transition-colors"
              style={sourceFilter === 'ebay'
                ? { background: 'rgba(96,165,250,0.2)' }
                : { background: 'rgba(232,184,48,0.2)' }}
            >
              <Icon icon="mdi:close" width={12} />
            </button>
          </div>
        </div>
      )}

      {/* View toggle */}
      <div className="flex items-center justify-end gap-1 mb-4">
        <button
          onClick={() => setViewMode('list')}
          className="btn-icon"
          style={viewMode === 'list' ? { borderColor: 'rgba(232,184,48,0.3)', background: 'rgba(232,184,48,0.08)' } : undefined}
          title="リスト表示"
        >
          <Icon icon="mdi:format-list-bulleted" width={16} style={{ opacity: viewMode === 'list' ? 0.8 : 0.3 }} />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className="btn-icon"
          style={viewMode === 'grid' ? { borderColor: 'rgba(232,184,48,0.3)', background: 'rgba(232,184,48,0.08)' } : undefined}
          title="グリッド表示"
        >
          <Icon icon="mdi:view-grid-outline" width={16} style={{ opacity: viewMode === 'grid' ? 0.8 : 0.3 }} />
        </button>
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <>
          <CardGridView cards={filtered} />
          {filtered.length === 0 && (
            <div className="empty-state">
              <Icon icon="mdi:card-search-outline" width={40} className="text-white/08 mx-auto mb-3" />
              <div className="text-xs text-white/20">条件に一致するカードがありません</div>
            </div>
          )}
        </>
      )}

      {/* Desktop: table */}
      {viewMode === 'list' && <div className="panel hidden md:block fade fd2">
        <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
          <table className="dtable">
            <thead>
              <tr>
                <th style={{ minWidth: 200 }}>カード名</th>
                <th style={{ minWidth: 120 }}>タイトル</th>
                <th style={{ minWidth: 80 }}>鑑定</th>
                <th style={{ minWidth: 90 }}>数量</th>
                <th className="text-right" style={{ minWidth: 100 }}>単価(原価)</th>
                <th className="text-right" style={{ minWidth: 110 }}>想定相場</th>
                <th className="text-right" style={{ minWidth: 110 }}>想定利益</th>
                <th style={{ minWidth: 80 }}>状態</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((card) => {
                const profit = getEstimatedProfit(card);
                const grading = gradingText(card);
                return (
                  <tr
                    key={card.id}
                    onClick={() => router.push(`/portfolio/${card.id}`)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="c-thumb"
                          style={{
                            background: thumbBg(card.title),
                            border: `1px solid ${thumbBorder(card.title)}`,
                          }}
                        >
                          <Icon
                            icon={titleIcon(card.title)}
                            width={13}
                            style={{ color: dotColor(card.title), opacity: 0.45 }}
                          />
                        </div>
                        <div>
                          <div className="text-[12px] font-medium text-white/65 hover:text-gold-400 transition-colors">
                            {card.display_name || card.name}
                          </div>
                          <div className="text-[9px] text-white/12 mt-0.5 font-display">
                            {new Date(card.created_at).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: dotColor(card.title), opacity: 0.35 }}
                        />
                        <span className="text-[11px] text-white/35">
                          {CARD_TITLE_LABELS[card.title]}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`text-[11px] font-display font-medium ${
                          grading === '未鑑定' ? 'text-white/18' : 'text-white/50'
                        }`}
                      >
                        {grading}
                      </span>
                    </td>
                    <td>
                      <div className="qty-wrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="qty-btn"
                          onClick={(e) => handleQuantity(e, card.id, -1)}
                          disabled={isPending}
                        >
                          −
                        </button>
                        <div className="qty-val">{card.quantity}</div>
                        <button
                          className="qty-btn"
                          onClick={(e) => handleQuantity(e, card.id, 1)}
                          disabled={isPending}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-display font-medium text-white/45 text-[12px]">
                        {formatCurrency(card.purchase_price + card.purchase_shipping)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="font-display font-medium text-white/55 text-[12px]">
                        {formatCurrency(card.estimated_price)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className={`font-display font-semibold text-[12px] ${
                          profit >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {formatProfit(profit * card.quantity)}
                      </span>
                      {card.quantity > 1 && (
                        <span className="block text-[10px] text-white/20 font-display font-normal">
                          (単価 {formatProfit(profit)})
                        </span>
                      )}
                    </td>
                    <td>{statusBadge(card.status)}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/cards/${card.id}/edit`);
                        }}
                      >
                        <Icon icon="mdi:pencil-outline" width={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-state">
              <Icon icon="mdi:card-search-outline" width={40} className="text-white/08 mx-auto mb-3" />
              <div className="text-xs text-white/20">条件に一致するカードがありません</div>
            </div>
          )}
        </div>
      </div>}

      {/* Mobile: card list */}
      {viewMode === 'list' && <div className="md:hidden space-y-2.5 fade fd3">
        {filtered.map((card) => {
          const profit = getEstimatedProfit(card);
          const grading = gradingText(card);
          return (
            <div
              key={card.id}
              className="m-card"
              onClick={() => router.push(`/portfolio/${card.id}`)}
            >
              <div className="flex items-start gap-3">
                <div
                  className="c-thumb"
                  style={{
                    background: thumbBg(card.title),
                    border: `1px solid ${thumbBorder(card.title)}`,
                  }}
                >
                  <Icon
                    icon={titleIcon(card.title)}
                    width={14}
                    style={{ color: dotColor(card.title), opacity: 0.45 }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-white/65 truncate">
                        {card.display_name || card.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{ background: dotColor(card.title), opacity: 0.3 }}
                        />
                        <span className="text-[9px] text-white/22">
                          {CARD_TITLE_LABELS[card.title]}
                        </span>
                        {grading !== '未鑑定' && (
                          <span className="text-[9px] text-white/15">
                            ・ {grading}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="flex-shrink-0" style={{ fontSize: 9 }}>
                      {statusBadge(card.status)}
                    </span>
                  </div>

                  <div className="flex items-end justify-between mt-3 pt-2.5 border-t border-white/[0.04]">
                    <div className="flex gap-4">
                      <div>
                        <div className="text-[8px] text-white/12 mb-0.5">原価</div>
                        <div className="font-display font-medium text-white/40 text-[11px]">
                          {formatCurrency(card.purchase_price + card.purchase_shipping)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] text-white/12 mb-0.5">相場</div>
                        <div className="font-display font-medium text-white/50 text-[11px]">
                          {formatCurrency(card.estimated_price)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-white/12 mb-0.5">利益</div>
                      <div
                        className={`font-display font-semibold text-[12px] ${
                          profit >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {formatProfit(profit * card.quantity)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <div className="qty-wrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="qty-btn"
                        style={{ width: 20, height: 20, fontSize: 12 }}
                        onClick={(e) => handleQuantity(e, card.id, -1)}
                        disabled={isPending}
                      >
                        −
                      </button>
                      <div className="qty-val" style={{ width: 22, height: 20, fontSize: 10 }}>
                        {card.quantity}
                      </div>
                      <button
                        className="qty-btn"
                        style={{ width: 20, height: 20, fontSize: 12 }}
                        onClick={(e) => handleQuantity(e, card.id, 1)}
                        disabled={isPending}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn-edit"
                      style={{ width: 24, height: 24 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/cards/${card.id}/edit`);
                      }}
                    >
                      <Icon icon="mdi:pencil-outline" width={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <Icon icon="mdi:card-search-outline" width={40} className="text-white/08 mx-auto mb-3" />
            <div className="text-xs text-white/20">条件に一致するカードがありません</div>
          </div>
        )}
      </div>}

      <div className="h-10" />
    </div>
  );
}
