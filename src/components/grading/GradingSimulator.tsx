'use client';

import { useState, useMemo } from 'react';
import type { GradingAgency } from '@/types/database';
import { AGENCY_DATA, simulateGradingCost } from '@/lib/calc/grading';
import { formatCurrency } from '@/lib/calc/profit';

const AGENCIES: Exclude<GradingAgency, 'none'>[] = ['PSA', 'BGS', 'CGC', 'ARS'];
const DEFAULT_USD_TO_JPY = 150;

export default function GradingSimulator() {
  const [agency, setAgency] = useState<Exclude<GradingAgency, 'none'>>('PSA');
  const [serviceLevelIndex, setServiceLevelIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [includeShipping, setIncludeShipping] = useState(true);
  const [usdToJpy, setUsdToJpy] = useState(DEFAULT_USD_TO_JPY);

  const agencyInfo = AGENCY_DATA[agency];

  const result = useMemo(
    () =>
      simulateGradingCost({
        agency,
        serviceLevelIndex,
        quantity,
        includeInternationalShipping: includeShipping,
        usdToJpy,
      }),
    [agency, serviceLevelIndex, quantity, includeShipping, usdToJpy]
  );

  return (
    <div className="space-y-6">
      {/* 鑑定機関選択 */}
      <div className="rounded-xl border border-border bg-card-bg p-6 card-glow">
        <h2 className="mb-4 text-sm font-semibold text-muted">鑑定機関を選択</h2>
        <div className="flex flex-wrap gap-2">
          {AGENCIES.map((a) => (
            <button
              key={a}
              onClick={() => {
                setAgency(a);
                setServiceLevelIndex(0);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                agency === a
                  ? 'bg-primary text-white'
                  : 'border border-border bg-card-bg hover:bg-white/5'
              }`}
            >
              {AGENCY_DATA[a].name}
            </button>
          ))}
        </div>
      </div>

      {/* 入力 */}
      <div className="rounded-xl border border-border bg-card-bg p-6 card-glow">
        <h2 className="mb-4 text-sm font-semibold text-muted">条件設定</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">サービスレベル</label>
            <select
              value={serviceLevelIndex}
              onChange={(e) => setServiceLevelIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {agencyInfo.serviceLevels.map((level, i) => (
                <option key={i} value={i}>
                  {level.name} (${level.priceUsd}/枚, 約{level.estimatedDays}日)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">枚数</label>
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">為替レート (USD/JPY)</label>
            <input
              type="number"
              min={1}
              value={usdToJpy}
              onChange={(e) => setUsdToJpy(Number(e.target.value) || DEFAULT_USD_TO_JPY)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="intl-shipping"
              checked={includeShipping}
              onChange={(e) => setIncludeShipping(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <label htmlFor="intl-shipping" className="text-sm">
              国際送料込み
            </label>
          </div>
        </div>
      </div>

      {/* 費用内訳 */}
      <div className="rounded-xl border border-border bg-card-bg p-6 card-glow">
        <h2 className="mb-4 text-sm font-semibold text-muted">費用内訳</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>鑑定料 (${agencyInfo.serviceLevels[serviceLevelIndex].priceUsd} x {quantity}枚)</span>
            <span className="font-medium">${result.gradingFeeUsd}</span>
          </div>
          {includeShipping && (
            <>
              <div className="flex justify-between">
                <span>送料（往路）</span>
                <span className="font-medium">${result.shippingToUsd}</span>
              </div>
              <div className="flex justify-between">
                <span>送料（復路）</span>
                <span className="font-medium">${result.shippingReturnUsd}</span>
              </div>
            </>
          )}
          <div className="border-t border-border pt-3 flex justify-between">
            <span>小計 (USD)</span>
            <span className="font-bold">${result.totalUsd}</span>
          </div>
          {includeShipping && result.customsDutyJpy > 0 && (
            <div className="flex justify-between">
              <span>関税（概算 10%）</span>
              <span className="font-medium">{formatCurrency(result.customsDutyJpy)}</span>
            </div>
          )}
          <div className="border-t border-border pt-3">
            <div className="flex justify-between text-base">
              <span className="font-bold">合計</span>
              <span className="font-bold text-primary">{formatCurrency(result.totalJpy)}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>1枚あたり</span>
              <span>{formatCurrency(result.perCardJpy)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 料金比較表 */}
      <div className="rounded-xl border border-border bg-card-bg p-6 card-glow">
        <h2 className="mb-4 text-sm font-semibold text-muted">鑑定機関 料金比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 font-medium">機関</th>
                <th className="pb-2 font-medium">サービス</th>
                <th className="pb-2 text-right font-medium">料金/枚</th>
                <th className="pb-2 text-right font-medium">目安日数</th>
              </tr>
            </thead>
            <tbody>
              {AGENCIES.map((a) =>
                AGENCY_DATA[a].serviceLevels.map((level, i) => (
                  <tr
                    key={`${a}-${i}`}
                    className={`border-b border-border last:border-0 ${
                      a === agency && i === serviceLevelIndex ? 'bg-primary/10' : ''
                    }`}
                  >
                    {i === 0 && (
                      <td
                        className="py-2 font-medium"
                        rowSpan={AGENCY_DATA[a].serviceLevels.length}
                      >
                        {AGENCY_DATA[a].name}
                      </td>
                    )}
                    <td className="py-2">{level.name}</td>
                    <td className="py-2 text-right">${level.priceUsd}</td>
                    <td className="py-2 text-right">{level.estimatedDays}日</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
