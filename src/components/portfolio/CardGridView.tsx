'use client';

import { useRouter } from 'next/navigation';
import type { Card } from '@/types/database';
import { GRADING_AGENCY_LABELS } from '@/types/database';
import { getEstimatedProfit, formatCurrency, formatProfit } from '@/lib/calc/profit';
import CardDetailSlab from '@/components/cards/slab/CardDetailSlab';

interface Props {
  cards: Card[];
}

export default function CardGridView({ cards }: Props) {
  const router = useRouter();

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 fade fd2">
      {cards.map((card) => {
        const profit = getEstimatedProfit(card);
        return (
          <div
            key={card.id}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => router.push(`/portfolio/${card.id}`)}
          >
            <CardDetailSlab
              imageUrl={card.image_url}
              cardId={card.id}
              grade={card.grade}
              agency={card.grading_agency !== 'none' ? card.grading_agency : undefined}
              title={card.title}
              cardName={card.display_name || card.name}
            />
            <div className="mt-2 px-1">
              <div className="text-[11px] font-medium text-white/60 truncate">
                {card.display_name || card.name}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-white/30 font-display">
                  {formatCurrency(card.estimated_price)}
                </span>
                <span
                  className={`text-[10px] font-display font-medium ${
                    profit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatProfit(profit * card.quantity)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
