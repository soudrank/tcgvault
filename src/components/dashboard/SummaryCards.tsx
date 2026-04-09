import type { Card } from '@/types/database';
import {
  getTotalInvestment,
  formatCurrency,
} from '@/lib/calc/profit';
import { calcMarketAssetValue } from '@/lib/ebay-market';
import { Icon } from '@iconify/react';

interface MarketPrice {
  cardId: string;
  marketPrice: number;
}

interface Props {
  cards: Card[];
  marketPrices?: MarketPrice[];
}

export default function SummaryCards({ cards, marketPrices }: Props) {
  const activeCards = cards.filter((c) => c.status !== 'sold');
  const totalAsset = marketPrices
    ? calcMarketAssetValue(activeCards, marketPrices)
    : activeCards.reduce((sum, c) => sum + c.estimated_price * c.quantity, 0);
  const totalInvestment = getTotalInvestment(activeCards);
  const totalProfit = totalAsset - totalInvestment;
  const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
  const cardCount = cards.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 md:mb-6">
      {/* 総資産額 */}
      <div className="stat-card fade fd1">
        <div className="text-[10px] text-white/22 mb-1.5">総資産額</div>
        <div className="text-xl md:text-[22px] font-display font-700 text-white/85 leading-none">
          {formatCurrency(totalAsset)}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          {totalProfit > 0 ? (
            <>
              <Icon icon="mdi:arrow-up" width={10} className="text-green-400/60" />
              <span className="text-[10px] text-green-400/60 font-medium">
                +{(totalInvestment > 0 ? ((totalAsset - totalInvestment) / totalInvestment) * 100 : 0).toFixed(1)}%
              </span>
            </>
          ) : totalProfit < 0 ? (
            <>
              <Icon icon="mdi:arrow-down" width={10} style={{ color: 'rgba(248,113,113,0.6)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'rgba(248,113,113,0.6)' }}>
                {(totalInvestment > 0 ? ((totalAsset - totalInvestment) / totalInvestment) * 100 : 0).toFixed(1)}%
              </span>
            </>
          ) : (
            <span className="text-[10px] text-white/15">--</span>
          )}
        </div>
      </div>

      {/* 総投資額 */}
      <div className="stat-card fade fd2">
        <div className="text-[10px] text-white/22 mb-1.5">総投資額</div>
        <div className="text-xl md:text-[22px] font-display font-700 text-white/85 leading-none">
          {formatCurrency(totalInvestment)}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[10px] text-white/15">{cardCount}枚のカード</span>
        </div>
      </div>

      {/* 想定利益 */}
      <div className="stat-card fade fd3">
        <div className="text-[10px] text-white/22 mb-1.5">想定利益</div>
        <div
          className={`text-xl md:text-[22px] font-display font-700 leading-none ${totalProfit >= 0 ? 'text-green-400' : ''}`}
          style={totalProfit < 0 ? { color: '#f87171' } : totalProfit === 0 ? { color: 'rgba(255,255,255,0.85)' } : undefined}
        >
          {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Icon icon="mdi:cards-outline" width={10} className="text-white/15" />
          <span className="text-[10px] text-white/15">売却時想定</span>
        </div>
      </div>

      {/* ROI */}
      <div className="stat-card fade fd4">
        <div className="text-[10px] text-white/22 mb-1.5">ROI</div>
        <div
          className={`text-xl md:text-[22px] font-display font-700 leading-none ${roi >= 0 ? 'text-green-400' : ''}`}
          style={roi < 0 ? { color: '#f87171' } : roi === 0 ? { color: 'rgba(255,255,255,0.85)' } : undefined}
        >
          {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          {roi > 0 ? (
            <Icon icon="mdi:arrow-up" width={10} className="text-green-400/60" />
          ) : roi < 0 ? (
            <Icon icon="mdi:arrow-down" width={10} style={{ color: 'rgba(248,113,113,0.6)' }} />
          ) : null}
          <span className="text-[10px] text-white/15">投資利益率</span>
        </div>
      </div>
    </div>
  );
}
