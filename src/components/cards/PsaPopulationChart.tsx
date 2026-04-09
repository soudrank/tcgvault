'use client';

import { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { PsaPopulation } from '@/types/database';
import { Icon } from '@iconify/react';
import { fetchAndStorePsaPop } from '@/lib/actions/psa-population';
import { useRouter } from 'next/navigation';

interface Props {
  history: PsaPopulation[];
  cardId: string;
}

type Period = '1m' | '3m' | '6m' | '1y' | 'all';

const PERIODS: { key: Period; label: string }[] = [
  { key: '1m', label: '1月' },
  { key: '3m', label: '3月' },
  { key: '6m', label: '6月' },
  { key: '1y', label: '1年' },
  { key: 'all', label: '全期間' },
];

function getStartDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case '1m': return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case '3m': return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case '6m': return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case '1y': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case 'all': return new Date(2000, 0, 1);
  }
}

export function PsaPopulationChart({ history, cardId }: Props) {
  const [period, setPeriod] = useState<Period>('all');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const chartData = useMemo(() => {
    const startDate = getStartDate(period);
    const filtered = history.filter((p) => new Date(p.fetched_at) >= startDate);

    return filtered.map((p) => ({
      date: new Date(p.fetched_at).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      }),
      pop: p.total_pop,
      fullDate: new Date(p.fetched_at).toLocaleDateString('ja-JP'),
    }));
  }, [history, period]);

  const latestPop = history.length > 0 ? history[history.length - 1].total_pop : 0;
  const popChange = chartData.length >= 2
    ? chartData[chartData.length - 1].pop - chartData[0].pop
    : 0;
  const popChangePercent = chartData.length >= 2 && chartData[0].pop > 0
    ? ((popChange / chartData[0].pop) * 100).toFixed(1)
    : '0.0';
  const isUp = popChange >= 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAndStorePsaPop(cardId);
      router.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  if (history.length === 0) {
    return (
      <div className="panel">
        <div className="flex items-center justify-between px-6 py-3.5 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.04)' }}>
          <div className="text-[11px] font-medium text-white/50">PSA Population</div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-icon disabled:opacity-50"
            style={{ width: 'auto', padding: '0 10px', gap: 4, display: 'flex', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}
            title="最新データを取得"
          >
            <Icon icon="mdi:refresh" width={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? '取得中...' : '更新'}
          </button>
        </div>
        <div className="py-8 text-center">
          <p className="text-[12px] text-white/35">PSA Populationデータがまだありません</p>
          <p className="mt-1 text-[11px] text-white/20">「更新」ボタンで最新データを取得できます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel" style={{ overflow: 'visible' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-3.5 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div>
            <div className="text-[11px] font-medium text-white/50">PSA Population</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-display font-bold text-white/80">{latestPop.toLocaleString()}枚</span>
              {chartData.length >= 2 && (
                <span className={`text-[10px] font-display font-medium ${isUp ? 'text-white/20' : 'text-red-400/70'}`}>
                  {isUp ? '+' : ''}{popChange.toLocaleString()} ({isUp ? '+' : ''}{popChangePercent}%)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-icon disabled:opacity-50"
            style={{ width: 'auto', padding: '0 10px', gap: 4, display: 'flex', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}
            title="最新データを取得"
          >
            <Icon icon="mdi:refresh" width={13} className={refreshing ? 'animate-spin' : ''} />
            更新
          </button>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`tab-pill ${period === p.key ? 'active' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-5" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="popGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()}枚`, '鑑定枚数']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
              labelStyle={{ fontSize: 11, color: '#e2e8f0' }}
              contentStyle={{ fontSize: 12, background: 'rgba(15,17,32,0.95)', borderColor: 'rgba(99,102,241,0.25)', color: '#e2e8f0', borderRadius: 8 }}
              itemStyle={{ color: '#e2e8f0' }}
              cursor={{ stroke: 'rgba(74,222,128,0.2)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="pop"
              name="鑑定枚数"
              stroke="#4ade80"
              strokeWidth={2}
              fill="url(#popGradient)"
              dot={chartData.length <= 30 ? { r: 4, fill: '#4ade80', strokeWidth: 0 } : false}
              activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="pb-3 text-[10px] text-white/20 text-center">
        {chartData.length}件のスナップショット
      </p>
    </div>
  );
}
