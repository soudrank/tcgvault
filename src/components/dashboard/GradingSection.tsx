import type { Card, GradingAgency } from '@/types/database';
import { Icon } from '@iconify/react';
import Link from 'next/link';

interface Props {
  cards: Card[];
}

interface AgencyData {
  agency: GradingAgency;
  label: string;
  cards: Card[];
  highestGrade: string;
  highestGradeCount: number;
  barPct: number;
  barColor: string;
  barPctLabel: string;
  badgeStyle: React.CSSProperties;
  isPsa: boolean;
}

const AGENCY_BADGE_STYLES: Record<string, React.CSSProperties> = {
  PSA: {
    background: 'rgba(212,160,23,0.08)',
    border: '1px solid rgba(212,160,23,0.15)',
  },
  BGS: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.6)',
  },
  CGC: {
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.12)',
    color: '#4ade80',
  },
  ARS: {
    background: 'rgba(168,85,247,0.08)',
    border: '1px solid rgba(168,85,247,0.12)',
    color: '#c084fc',
  },
  Gemix: {
    background: 'rgba(59,130,246,0.08)',
    border: '1px solid rgba(59,130,246,0.12)',
    color: '#60a5fa',
  },
  TAG: {
    background: 'rgba(249,115,22,0.08)',
    border: '1px solid rgba(249,115,22,0.12)',
    color: '#fb923c',
  },
};

const AGENCY_BAR_COLORS: Record<string, string> = {
  PSA: 'linear-gradient(90deg,#b8860b,#f0d060)',
  BGS: 'rgba(255,255,255,0.2)',
  CGC: '#22c55e',
  ARS: '#a855f7',
  Gemix: '#3b82f6',
  TAG: '#f97316',
};

const AGENCY_PCT_CLASS: Record<string, string> = {
  PSA: 'text-gold-400/40',
  BGS: 'text-white/20',
  CGC: 'text-green-400/40',
  ARS: 'text-purple-400/40',
  Gemix: 'text-blue-400/40',
  TAG: 'text-amber-400/40',
};

function getAgencyData(cards: Card[]): AgencyData[] {
  const agencies: GradingAgency[] = ['PSA', 'BGS', 'CGC', 'ARS', 'Gemix', 'TAG'];
  const gradedCards = cards.filter((c) => c.grading_agency !== 'none' && c.grade !== null);
  const totalGraded = gradedCards.length;

  return agencies.map((agency) => {
    const agencyCards = cards.filter((c) => c.grading_agency === agency && c.grade !== null);
    const highestGrade = agencyCards.length > 0
      ? Math.max(...agencyCards.map((c) => c.grade!))
      : 0;
    const highestGradeCards = agencyCards.filter((c) => c.grade === highestGrade);
    const count = highestGradeCards.reduce((sum, c) => sum + c.quantity, 0);
    const pct = totalGraded > 0 ? (agencyCards.length / totalGraded) * 100 : 0;

    return {
      agency,
      label: agency,
      cards: agencyCards,
      highestGrade: highestGrade > 0 ? String(highestGrade) : '--',
      highestGradeCount: count,
      barPct: pct,
      barColor: AGENCY_BAR_COLORS[agency] || 'rgba(255,255,255,0.2)',
      barPctLabel: `${pct.toFixed(1)}%`,
      badgeStyle: AGENCY_BADGE_STYLES[agency] || AGENCY_BADGE_STYLES.BGS,
      isPsa: agency === 'PSA',
    };
  });
}

export default function GradingSection({ cards }: Props) {
  const agencyData = getAgencyData(cards);
  const gradedCount = cards.filter((c) => c.grading_agency !== 'none' && c.grade !== null).reduce((sum, c) => sum + c.quantity, 0);
  const submittedCount = cards.filter((c) => c.status === 'submitted').reduce((sum, c) => sum + c.quantity, 0);
  const ungradedCount = cards.filter((c) => c.grading_agency === 'none' && c.status !== 'submitted').reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="panel fade" style={{ animationDelay: '.35s', opacity: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg bg-green-500/[0.06] border border-green-500/[0.1] flex items-center justify-center"
          >
            <Icon icon="mdi:certificate-outline" width={15} className="text-green-400/70" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-white/50">評価カード管理</div>
            <div className="text-[9px] text-white/15 mt-0.5">
              PSA・BGS・CGC・ARS — グレード別に整理、PSA Population Report連携
            </div>
          </div>
        </div>
        <Link
          href="/portfolio"
          className="text-[9px] text-gold-400/60 hover:text-gold-400 transition-colors font-medium flex items-center gap-1 no-underline"
        >
          詳細を見る
          <Icon icon="mdi:chevron-right" width={13} />
        </Link>
      </div>

      <div className="p-5 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {agencyData.map((data) => (
            <div key={data.agency} className="grading-card">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[9px] text-white/20 tracking-widest uppercase font-display font-600">
                  {data.label}
                </div>
                {data.isPsa && data.cards.length > 0 ? (
                  <div
                    className="w-5 h-5 rounded-md bg-green-500/[0.08] border border-green-500/[0.12] flex items-center justify-center"
                  >
                    <Icon icon="mdi:check" width={10} className="text-green-400/50" />
                  </div>
                ) : (
                  <div
                    className="w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"
                  >
                    <span className="text-[8px] text-white/20 font-display">—</span>
                  </div>
                )}
              </div>

              <div className="flex items-end gap-3 mb-3">
                <div
                  className={`grading-badge ${data.isPsa && data.cards.length > 0 ? 'grading-badge-psa' : ''}`}
                  style={data.isPsa && data.cards.length > 0 ? { border: data.badgeStyle.border } : data.badgeStyle}
                >
                  {data.highestGrade}
                </div>
                <div className="pb-1">
                  <div className="text-[10px] text-white/20">最高グレード</div>
                  <div className="text-lg font-display font-700 text-white/70 leading-none mt-0.5">
                    {data.highestGradeCount}
                    <span className="text-[10px] text-white/20 font-normal ml-0.5">枚</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[8px] text-white/15">
                    {data.label} {data.highestGrade} 構成比
                  </span>
                  <span className={`text-[8px] font-display ${AGENCY_PCT_CLASS[data.agency] || 'text-white/20'}`}>
                    {data.barPctLabel}
                  </span>
                </div>
                <div className="grade-bar">
                  <div
                    className="grade-bar-fill"
                    style={{
                      width: `${data.barPct}%`,
                      background: data.barColor,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[9px] text-white/15 mb-0.5">評価済みカード</div>
              <div className="text-base font-display font-700 text-white/70">
                {gradedCount}
                <span className="text-[10px] text-white/20 font-normal ml-0.5">枚</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-white/15 mb-0.5">鑑定中</div>
              <div className="text-base font-display font-700 text-gold-400/80">
                {submittedCount}
                <span className="text-[10px] text-gold-400/30 font-normal ml-0.5">枚</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-[9px] text-white/15 mb-0.5">未鑑定</div>
              <div className="text-base font-display font-700 text-white/35">
                {ungradedCount}
                <span className="text-[10px] text-white/15 font-normal ml-0.5">枚</span>
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/[0.04] border border-green-500/[0.08]"
          >
            <Icon icon="mdi:database-check-outline" width={13} className="text-green-400/50" />
            <span className="text-[10px] text-green-400/50">PSA Pop. Report連携済み</span>
          </div>
        </div>
      </div>
    </div>
  );
}
