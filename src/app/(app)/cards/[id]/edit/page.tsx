import CardForm from '@/components/cards/CardForm';
import { getCard } from '@/lib/actions/cards';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCardPage({ params }: Props) {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) notFound();

  return (
    <div style={{ padding: '24px 16px 0', maxWidth: 840, margin: '0 auto' }} className="md:px-6 lg:px-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4 fade">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/55 transition-colors"
        >
          <Icon icon="mdi:arrow-left" width={14} />
          カード一覧
        </Link>
        <Link
          href={`/portfolio/${card.id}`}
          className="btn-ghost-app inline-flex items-center gap-2 text-[11px]"
        >
          <Icon icon="mdi:chart-bar" width={14} className="text-gold-400" />
          詳細・チャート
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 fade">
        <div className="flex items-center gap-2 mb-1">
          <Icon icon="mdi:card-plus-outline" width={16} className="text-white/12" />
          <span className="text-[10px] text-white/18 tracking-wider uppercase font-display">Edit Card</span>
        </div>
        <h1 className="font-body font-bold text-xl md:text-2xl tracking-tight text-white/85">
          カード編集 - {card.name}
        </h1>
      </div>

      <CardForm card={card} />
    </div>
  );
}
