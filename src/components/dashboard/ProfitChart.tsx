'use client';

import type { Card, CardTitle } from '@/types/database';
import { getEstimatedProfit, formatCurrency } from '@/lib/calc/profit';
import { CARD_TITLE_LABELS } from '@/types/database';
import { useRouter } from 'next/navigation';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  PieChart,
  Pie,
} from 'recharts';
import { useState, useEffect, useMemo, useCallback } from 'react';

interface MarketPrice {
  cardId: string;
  marketPrice: number;
}

interface Props {
  cards: Card[];
  marketPrices?: MarketPrice[];
}

const COLORS = ['#e8b830', '#60a5fa', '#4ade80', '#c084fc', '#f87171', '#38bdf8', '#fb923c'];

type ViewType = 'line' | 'asset' | 'profit' | 'composition';
type PeriodType = '1w' | '1m' | '3m' | '6m' | '1y';

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '...' : s;
}

const PERIODS: { key: PeriodType; label: string }[] = [
  { key: '1w', label: '1週' },
  { key: '1m', label: '1月' },
  { key: '3m', label: '3月' },
  { key: '6m', label: '6月' },
  { key: '1y', label: '1年' },
];

const TITLES: Record<ViewType, string> = {
  line: '資産推移',
  asset: '資産（カード別）',
  profit: '利益（カード別）',
  composition: '構成（タイトル別）',
};

const SUBTITLES: Record<ViewType, string> = {
  line: '',
  asset: '時価順ソート',
  profit: '利益順ソート',
  composition: 'タイトル別構成比',
};

const VIEWS: { key: ViewType; label: string }[] = [
  { key: 'line', label: '推移' },
  { key: 'asset', label: '資産' },
  { key: 'profit', label: '利益' },
  { key: 'composition', label: '構成' },
];

export default function ProfitChart({ cards, marketPrices }: Props) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [view, setView] = useState<ViewType>('line');
  const [period, setPeriod] = useState<PeriodType>('1w');

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'line' || hash === 'asset' || hash === 'profit' || hash === 'composition') {
        setView(hash);
      }
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const changeView = (v: ViewType) => {
    setView(v);
    window.history.pushState(null, '', `#${v}`);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const check = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsMobile(window.innerWidth < 640), 150);
    };
    setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', check);
    return () => { clearTimeout(timer); window.removeEventListener('resize', check); };
  }, []);

  const activeCards = useMemo(() => cards.filter((c) => c.status !== 'sold'), [cards]);

  const assetData = useMemo(() =>
    activeCards
      .map((c) => ({
        id: c.id,
        name: truncate(c.display_name || c.name, 8),
        value: c.estimated_price * c.quantity,
      }))
      .sort((a, b) => b.value - a.value),
    [activeCards]
  );

  const profitData = useMemo(() =>
    activeCards
      .map((c) => ({
        id: c.id,
        name: truncate(c.display_name || c.name, 8),
        profit: getEstimatedProfit(c) * c.quantity,
      }))
      .sort((a, b) => b.profit - a.profit),
    [activeCards]
  );

  const handleBarClick = useCallback((dataArr: { id: string }[], index: number) => {
    if (dataArr[index]) {
      router.push(`/portfolio/${dataArr[index].id}`);
    }
  }, [router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCursorClick = useCallback((e: any, dataArr: { id: string }[]) => {
    if (!e || e.activeTooltipIndex === undefined || e.activeTooltipIndex === null) return;
    handleBarClick(dataArr, e.activeTooltipIndex);
  }, [handleBarClick]);

  const pieData = useMemo(() => {
    const titleAgg = new Map<CardTitle, number>();
    activeCards.forEach((c) => {
      titleAgg.set(c.title, (titleAgg.get(c.title) || 0) + c.estimated_price * c.quantity);
    });
    return Array.from(titleAgg.entries()).map(([key, value]) => ({
      key,
      name: CARD_TITLE_LABELS[key],
      value,
    }));
  }, [activeCards]);

  const handlePieClick = (titleKey: CardTitle) => {
    router.push(`/portfolio?title=${titleKey}`);
  };

  const horizontalBarHeight = Math.max(200, activeCards.length * 40);

  const tooltipStyle = {
    contentStyle: {
      fontSize: 12,
      background: 'rgba(14,14,22,0.94)',
      borderColor: 'rgba(212,160,23,0.2)',
      color: '#e8e4dc',
      borderRadius: 8,
    },
    labelStyle: { fontSize: 12, color: '#e8e4dc' },
    itemStyle: { color: '#e8e4dc' },
    cursor: { fill: 'rgba(255,255,255,0.04)' },
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
          <div className="text-[11px] font-medium text-white/50">{TITLES[view]}</div>
          <div className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.15)', display: 'flex', gap: '0.25rem' }}>
            {view === 'line'
              ? PERIODS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    className="text-[9px] px-2 py-0.5 rounded transition-colors"
                    style={period === p.key
                      ? { background: 'rgba(212,160,23,0.15)', color: 'rgba(232,184,48,0.8)' }
                      : { color: 'rgba(255,255,255,0.2)' }}
                  >
                    {p.label}
                  </button>
                ))
              : SUBTITLES[view]}
          </div>
        </div>
        <div className="flex gap-1">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => changeView(v.key)}
              className={`tab-btn${view === v.key ? ' active' : ''}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-5">
        {/* Line chart — recharts AreaChart (実データ: created_atから月次集計) */}
        {view === 'line' && (() => {
          const now = new Date();
          const priceMap = new Map(marketPrices?.map((p) => [p.cardId, p.marketPrice]) ?? []);
          const chartData: { label: string; manual: number; market: number }[] = [];

          const calcTotals = (cutoff: Date) => {
            const active = cards.filter((c) => c.status !== 'sold' && new Date(c.created_at) <= cutoff);
            // 金線: eBay未連携カードの設定価格のみ
            const manual = active
              .filter((c) => !priceMap.has(c.id) || !(priceMap.get(c.id)! > 0))
              .reduce((s, c) => s + c.estimated_price * c.quantity, 0);
            // 青線: eBay連携カードのeBay価格のみ
            const market = active.reduce((s, c) => {
              const mp = priceMap.get(c.id);
              return s + (mp && mp > 0 ? mp * c.quantity : 0);
            }, 0);
            return { manual, market };
          };

          if (period === '1w') {
            for (let i = 6; i >= 0; i--) {
              const d = new Date(now);
              d.setDate(d.getDate() - i);
              d.setHours(23, 59, 59, 999);
              const { manual, market } = calcTotals(d);
              chartData.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, manual, market });
            }
          } else if (period === '1m') {
            for (let i = 3; i >= 0; i--) {
              const d = new Date(now);
              d.setDate(d.getDate() - i * 7);
              d.setHours(23, 59, 59, 999);
              const { manual, market } = calcTotals(d);
              chartData.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, manual, market });
            }
          } else {
            const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
            for (let i = months - 1; i >= 0; i--) {
              const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
              const { manual, market } = calcTotals(endOfMonth);
              chartData.push({ label: `${endOfMonth.getMonth() + 1}月`, manual, market });
            }
          }

          return (
            <div style={{ height: 260 }}>
              <div className="flex items-center gap-4 mb-2 px-1">
                <a href="/portfolio?source=ebay" className="flex items-center gap-1.5 no-underline" style={{ opacity: 0.8 }}>
                  <div className="w-2.5 h-0.5 rounded-full" style={{ background: '#60a5fa' }} />
                  <span className="text-[9px]" style={{ color: '#60a5fa' }}>eBay相場 →</span>
                </a>
                <a href="/portfolio?source=manual" className="flex items-center gap-1.5 no-underline" style={{ opacity: 0.8 }}>
                  <div className="w-2.5 h-0.5 rounded-full" style={{ background: '#e8b830' }} />
                  <span className="text-[9px]" style={{ color: '#e8b830' }}>設定価格 →</span>
                </a>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="dashAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4a017" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#d4a017" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashAreaGradMarket" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.15)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.1)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 10000)}万`} width={35} />
                  <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name === 'market' ? 'eBay相場' : '設定価格']} {...tooltipStyle} />
                  <Area type="monotone" dataKey="market" stroke="#60a5fa" strokeWidth={2} fill="url(#dashAreaGradMarket)" dot={{ r: 3, fill: '#60a5fa', stroke: '#06060a', strokeWidth: 2, cursor: 'pointer' }} activeDot={{ r: 5, fill: '#93c5fd', stroke: '#06060a', strokeWidth: 2, cursor: 'pointer', onClick: () => router.push('/portfolio?source=ebay') }} />
                  <Area type="monotone" dataKey="manual" stroke="#e8b830" strokeWidth={2} fill="url(#dashAreaGrad)" dot={{ r: 3, fill: '#d4a017', stroke: '#06060a', strokeWidth: 2, cursor: 'pointer' }} activeDot={{ r: 5, fill: '#f0d060', stroke: '#06060a', strokeWidth: 2, cursor: 'pointer', onClick: () => router.push('/portfolio?source=manual') }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        })()}

        {/* Composition donut */}
        {view === 'composition' && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy={isMobile ? '45%' : '48%'}
                  innerRadius={isMobile ? 35 : 60}
                  outerRadius={isMobile ? 65 : 110}
                  paddingAngle={3}
                  dataKey="value"
                  cursor="pointer"
                  onClick={(_, index) => handlePieClick(pieData[index].key)}
                  label={({ name, value, cx, x, y, midAngle = 0 }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = isMobile ? 85 : 130;
                    const xPos = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
                    const anchor = xPos > Number(cx) ? 'start' : 'end';
                    const fs = isMobile ? 10 : 12;
                    return (
                      <text x={x} y={y} textAnchor={anchor} fontSize={fs} fill="rgba(255,255,255,0.4)">
                        <tspan fontWeight="600">{name}</tspan>
                        <tspan x={x} dy={isMobile ? 13 : 16} fontSize={fs - 1} fill="rgba(255,255,255,0.25)">
                          {formatCurrency(value as number)}
                        </tspan>
                      </text>
                    );
                  }}
                  labelLine={{ strokeWidth: 1, stroke: 'rgba(255,255,255,0.1)' }}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar charts (asset / profit) */}
        {(view === 'asset' || view === 'profit') && (
          <>
            {/* PC: vertical bar chart */}
            <div className="relative hidden sm:block h-72">
              <ResponsiveContainer width="100%" height="100%">
                {view === 'asset' ? (
                  <BarChart data={assetData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }} onClick={(e) => handleCursorClick(e, assetData)}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} interval={0} height={60} angle={-35} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={45} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} {...tooltipStyle} />
                    <Bar dataKey="value" name="資産額" radius={[4, 4, 0, 0]} cursor="pointer">
                      {assetData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart data={profitData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }} onClick={(e) => handleCursorClick(e, profitData)}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} interval={0} height={60} angle={-35} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={45} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} {...tooltipStyle} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                    <Bar dataKey="profit" name="利益" cursor="pointer">
                      {profitData.map((entry, i) => (
                        <Cell key={i} fill={entry.profit >= 0 ? '#4ade80' : '#f87171'} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Mobile: horizontal bar chart */}
            <div className="sm:hidden overflow-y-auto" style={{ maxHeight: 340 }}>
              <div className="relative" style={{ height: horizontalBarHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  {view === 'asset' ? (
                    <BarChart data={assetData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: -15 }} onClick={(e) => handleCursorClick(e, assetData)}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} width={120} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} {...tooltipStyle} />
                      <Bar dataKey="value" name="資産額" radius={[0, 4, 4, 0]} barSize={24} cursor="pointer">
                        {assetData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <BarChart data={profitData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: -15 }} onClick={(e) => handleCursorClick(e, profitData)}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} width={120} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} {...tooltipStyle} />
                      <ReferenceLine x={0} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                      <Bar dataKey="profit" name="利益" barSize={24} cursor="pointer">
                        {profitData.map((entry, i) => (
                          <Cell key={i} fill={entry.profit >= 0 ? '#4ade80' : '#f87171'} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
