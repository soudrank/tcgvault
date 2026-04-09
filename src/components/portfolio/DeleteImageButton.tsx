'use client';

import { updateCardImages } from '@/lib/actions/cards';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function DeleteImageButton({ cardId }: { cardId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('この画像を削除しますか？')) return;
    setLoading(true);
    try {
      await updateCardImages(cardId, { image_url: null });
      router.refresh();
    } catch {
      alert('画像の削除に失敗しました');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-xs font-medium text-red-400/60 transition-colors hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
      style={{ border: '1px solid rgba(239,68,68,0.1)' }}
    >
      <Icon icon="mdi:image-remove" width={14} />
      この画像を削除
    </button>
  );
}
