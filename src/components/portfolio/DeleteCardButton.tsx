'use client';

import { deleteCard } from '@/lib/actions/cards';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useState } from 'react';

interface Props {
  cardId: string;
  variant?: 'icon' | 'full';
}

export default function DeleteCardButton({ cardId, variant = 'icon' }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('このカードを削除しますか？')) return;
    setLoading(true);
    try {
      await deleteCard(cardId);
      router.push('/portfolio');
    } catch {
      alert('削除に失敗しました');
      setLoading(false);
    }
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-xs font-medium text-red-400/60 transition-colors hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        style={{ border: '1px solid rgba(239,68,68,0.1)' }}
      >
        <Icon icon="mdi:trash-can-outline" width={14} />
        このカードを削除
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-icon danger disabled:opacity-50"
      title="削除"
    >
      <Icon icon="mdi:trash-can-outline" width={15} />
    </button>
  );
}
