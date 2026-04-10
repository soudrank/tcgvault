import { Suspense } from 'react';
import DashboardMarketSection from '@/components/dashboard/DashboardMarketSection';
import DashboardMarketSkeleton from '@/components/dashboard/DashboardMarketSkeleton';
import GradingSection from '@/components/dashboard/GradingSection';
import { getCards } from '@/lib/actions/cards';
import { Icon } from '@iconify/react';

export default async function DashboardPage() {
  const cards = await getCards();

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

      {/* Market data section (slow) - wrapped in Suspense */}
      <Suspense fallback={<DashboardMarketSkeleton />}>
        <DashboardMarketSection cards={cards} />
      </Suspense>

      {/* Grading Management (uses cards only) */}
      <GradingSection cards={cards} />

      <div className="h-10" />
    </div>
  );
}
