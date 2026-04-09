import CardForm from '@/components/cards/CardForm';
import { Icon } from '@iconify/react';

export default function NewCardPage() {
  return (
    <div style={{ padding: '24px 16px 0', maxWidth: 840, margin: '0 auto' }} className="md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 fade" style={{ marginTop: 8 }}>
        <div className="flex items-center gap-2 mb-1">
          <Icon icon="mdi:card-plus-outline" width={16} className="text-white/12" />
          <span className="text-[10px] text-white/18 tracking-wider uppercase font-display">New Card</span>
        </div>
        <h1 className="font-body font-bold text-xl md:text-2xl tracking-tight text-white/85">カード登録</h1>
      </div>
      <CardForm />
    </div>
  );
}
