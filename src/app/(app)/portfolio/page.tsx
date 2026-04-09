import CardList from '@/components/portfolio/CardList';
import { getCards } from '@/lib/actions/cards';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default async function PortfolioPage() {
  const cards = await getCards();

  return (
    <div style={{ padding: '24px 16px 0', maxWidth: 1100, margin: '0 auto' }} className="md:px-6 lg:px-8 fade">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5 md:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon icon="mdi:cards-outline" width={16} className="text-white/12" />
            <span className="text-[10px] text-white/18 tracking-wider uppercase font-display">Cards</span>
          </div>
          <h1 className="font-bold text-xl md:text-2xl tracking-tight text-white/85">カード一覧</h1>
          <div className="text-[11px] text-white/20 mt-1">
            <span className="font-display">{cards.reduce((sum, c) => sum + c.quantity, 0)}</span>枚のカード
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/cards/new"
            className="btn-add"
          >
            <Icon icon="mdi:plus" width={14} />
            カード登録
          </Link>
        </div>
      </div>
      <CardList cards={cards} />
    </div>
  );
}
