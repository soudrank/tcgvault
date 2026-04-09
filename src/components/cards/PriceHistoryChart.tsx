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
import { formatCurrency } from '@/lib/calc/profit';

interface PricePoint {
  price: number;
  recorded_at: string;
}

interface Props {
  history: PricePoint[];
  currentPrice: number;
  ebayPrices?: PricePoint[];
}

type Period = '1w' | '1m' | '3m' | '6m' | '1y' | 'all';

const PERIODS: { key: Period; label: string }[] = [
  { key: '1w', label: '1週' },
  { key: '1m', label: '1月' },
  { key: '3m', label: '3月' },
  { key: '6m', label: '6月' },
  { key: '1y', label: '1年' },
  { key: 'all', label: '全期間' },
];

type Source = 'all' | 'manual' | 'ebay';

function getStartDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case '1w': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '1m': return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case '3m': return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case '6m': return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case '1y': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case 'all': return new Date(2000, 0, 1);
  }
}

export function PriceHistoryChart({ history, currentPrice, ebayPrices = [] }: Props) {
  const [period, setPeriod] = useState<Period>('all');
  const [source, setSource] = useState<Source>('all');

  const hasEbay = ebayPrices.length > 0;
  const hasManual = history.length > 0;

  const chartData = useMemo(() => {
    const startDate = getStartDate(period);

    let points: (PricePoint & { source: 'manual' | 'ebay' })[] = [];

    if (source === 'all' || source === 'manual') {
      points.push(...history.map((p) => ({ ...p, source: 'manual' as const })));
    }
    if (source === 'all' || source === 'ebay') {
      points.push(...ebayPrices.map((p) => ({ ...p, source: 'ebay' as const })));
    }

    const filtered = points.filter((p) => new Date(p.recorded_at) >= startDate);
    filtered.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

    return filtered.map((p) => ({
      date: new Date(p.recorded_at).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      }),
      price: p.price,
      fullDate: new Date(p.recorded_at).toLocaleDateString('ja-JP'),
      source: p.source,
    }));
  }, [history, ebayPrices, period, source]);

  // 変動率を計算
  const priceChange = chartData.length >= 2
    ? chartData[chartData.length - 1].price - chartData[0].price
    : 0;
  const priceChangePercent = chartData.length >= 2 && chartData[0].price > 0
    ? ((priceChange / chartData[0].price) * 100).toFixed(1)
    : '0.0';
  const isUp = priceChange >= 0;

  if (!hasManual && !hasEbay) {
    return (
      <div className="panel">
        <div className="px-6 py-3.5 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.04)' }}>
          <div className="text-[11px] font-medium text-white/50">取引相場チャート</div>
        </div>
        <div className="py-8 text-center">
          <p className="text-[12px] text-white/35">取引データがまだありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel" style={{ overflow: 'visible' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-3.5 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div>
            <div className="text-[11px] font-medium text-white/50">価格推移</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-display font-bold text-white/80">{formatCurrency(currentPrice)}</span>
              {chartData.length >= 2 && (
                <span className={`text-[10px] font-display font-medium ${isUp ? 'text-green-400/70' : 'text-red-400/70'}`}>
                  {isUp ? '+' : ''}{formatCurrency(priceChange)} ({isUp ? '+' : ''}{priceChangePercent}%)
                </span>
              )}
            </div>
          </div>
          {/* データソース切り替え */}
          {hasEbay && (
            <div className="flex gap-1">
              {(['all', 'ebay', ...(hasManual ? ['manual'] : [])] as Source[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={`tab-pill ${source === s ? 'active' : ''}`}
                >
                  {s === 'all' ? 'すべて' : s === 'ebay' ? 'eBay出品' : '自己記録'}
                </button>
              ))}
            </div>
          )}
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

      <div className="p-4 md:p-5" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? '#16a34a' : '#dc2626'} stopOpacity={0.15} />
                <stop offset="95%" stopColor={isUp ? '#16a34a' : '#dc2626'} stopOpacity={0} />
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
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload;
                const sourceLabel = p?.source === 'ebay' ? ' (eBay)' : p?.source === 'manual' ? ' (自己記録)' : '';
                return (p?.fullDate || '') + sourceLabel;
              }}
              labelStyle={{ fontSize: 11, color: '#e2e8f0' }}
              contentStyle={{ fontSize: 12, background: 'rgba(15,17,32,0.95)', borderColor: 'rgba(99,102,241,0.25)', color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              name="相場"
              stroke={isUp ? '#16a34a' : '#dc2626'}
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={chartData.length <= 30}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="pb-3 text-[10px] text-white/20 text-center">
        {chartData.length}件の記録
        {hasEbay && source !== 'manual' && ` (eBay出品 ${ebayPrices.length}件含む)`}
      </p>
    </div>
  );
}
