import SummaryCards from '@/components/dashboard/SummaryCards';
import ProfitChart from '@/components/dashboard/ProfitChart';
import RecentCards from '@/components/dashboard/RecentCards';
import GradingSection from '@/components/dashboard/GradingSection';
import { getCards } from '@/lib/actions/cards';
import { fetchMarketPrices } from '@/lib/ebay-market';
import { Icon } from '@iconify/react';

export default async function DashboardPage() {
  const cards = await getCards();
  const activeCards = cards.filter((c) => c.status !== 'sold');
  const ebayCards = activeCards.filter((c) => c.ebay_linked);
  const marketPrices = await fetchMarketPrices(ebayCards);

  return (
    <div className="p-4 md:p-6 lg:px-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-5 md:mb-7 fade" style={{ paddingTop: 8 }}>
        <div className="flex items-center gap-2 mb-1">
          <Icon icon="mdi:view-dashboard-outline" width={16} className="text-white/12" />
          <span className="text-[10px] text-white/18 tracking-wider uppercase font-display">
            Dashboard
          </span>
        </div>
        <h1 className="font-body font-700 text-xl md:text-2xl tracking-tight text-white/85">
          ダッシュボード
        </h1>
      </div>

      {/* Stats */}
      <SummaryCards cards={cards} marketPrices={marketPrices} />

      {/* Chart + Card List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-5">
        <div className="lg:col-span-2 panel fade fd5">
          <ProfitChart cards={cards} marketPrices={marketPrices} />
        </div>
        <div className="panel fade fd6">
          <RecentCards cards={cards} />
        </div>
      </div>

      {/* Grading Management */}
      <GradingSection cards={cards} />

      <div className="h-10" />
    </div>
  );
}
