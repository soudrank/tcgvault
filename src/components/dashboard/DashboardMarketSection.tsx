import type { Card } from '@/types/database';
import { fetchMarketPrices } from '@/lib/ebay-market';
import SummaryCards from './SummaryCards';
import ProfitChart from './ProfitChart';
import RecentCards from './RecentCards';

interface Props {
  cards: Card[];
}

export default async function DashboardMarketSection({ cards }: Props) {
  const activeCards = cards.filter((c) => c.status !== 'sold');
  const ebayCards = activeCards.filter((c) => c.ebay_linked);
  const marketPrices = await fetchMarketPrices(ebayCards);

  return (
    <>
      <SummaryCards cards={cards} marketPrices={marketPrices} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-5">
        <div className="lg:col-span-2 panel fade fd5">
          <ProfitChart cards={cards} marketPrices={marketPrices} />
        </div>
        <div className="panel fade fd6">
          <RecentCards cards={cards} />
        </div>
      </div>
    </>
  );
}
