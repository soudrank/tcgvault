import type { Card } from '@/types/database';
import { CARD_TITLE_LABELS, GRADING_AGENCY_LABELS } from '@/types/database';
import { getEstimatedProfit, formatCurrency, getCostBasis } from '@/lib/calc/profit';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface Props {
  cards: Card[];
}

const TITLE_COLORS: Record<string, string> = {
  pokemon: 'rgba(250,204,21,0.12)',
  yugioh: 'rgba(168,85,247,0.12)',
  onepiece: 'rgba(239,68,68,0.12)',
  digimon: 'rgba(59,130,246,0.12)',
  dragonball: 'rgba(249,115,22,0.12)',
  duel_masters: 'rgba(34,197,94,0.12)',
  other: 'rgba(255,255,255,0.06)',
};

const TITLE_ICON_COLORS: Record<string, string> = {
  pokemon: '#f59e0b',
  yugioh: '#a855f7',
  onepiece: '#f97316',
  digimon: '#14b8a6',
  dragonball: '#eab308',
  duel_masters: '#22c55e',
  other: 'rgba(255,255,255,0.3)',
};

function getGradeLabel(card: Card): string {
  if (card.grading_agency === 'none') {
    return card.status === 'submitted' ? '鑑定中' : '未鑑定';
  }
  return `${GRADING_AGENCY_LABELS[card.grading_agency]} ${card.grade ?? ''}`;
}

export default function RecentCards({ cards }: Props) {
  const recent = [...cards]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="text-[11px] font-medium text-white/50">最近のカード</div>
        <Link
          href="/portfolio"
          className="text-[9px] text-gold-400/60 hover:text-gold-400 transition-colors no-underline"
        >
          すべて見る
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="py-16 text-center">
          <Icon
            icon="mdi:cards-outline"
            width={44}
            className="mx-auto mb-3"
            style={{ color: 'rgba(255,255,255,0.06)' }}
          />
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
            カードが登録されていません
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
          {recent.map((card) => {
            const profit = getEstimatedProfit(card);
            const costBasis = getCostBasis(card);
            const profitPct = costBasis > 0 ? (profit / costBasis) * 100 : 0;
            const iconColor = TITLE_ICON_COLORS[card.title] || TITLE_ICON_COLORS.other;
            return (
              <Link key={card.id} href={`/portfolio/${card.id}`} className="card-row no-underline">
                <div
                  className="c-thumb"
                  style={{ background: TITLE_COLORS[card.title] || TITLE_COLORS.other }}
                >
                  <Icon
                    icon="mdi:cards-outline"
                    width={14}
                    style={{ color: iconColor, opacity: 0.5 }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {card.display_name || card.name}
                  </div>
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {CARD_TITLE_LABELS[card.title]} &middot; {getGradeLabel(card)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className="font-display text-[12px] font-[600]"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {formatCurrency(card.estimated_price)}
                  </div>
                  <div
                    className="font-display text-[10px] font-[500]"
                    style={{ color: profitPct >= 0 ? '#4ade80' : '#f87171' }}
                  >
                    {profitPct >= 0 ? '+' : ''}{profitPct.toFixed(1)}%
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
