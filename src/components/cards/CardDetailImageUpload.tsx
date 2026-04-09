'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Loader2, X, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { CardImageUpload } from './CardImageUpload';
import { updateCardImages } from '@/lib/actions/cards';
import { createClient } from '@/lib/supabase/client';

interface SearchResult {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
}

interface Props {
  cardId: string;
  cardTitle: string;
  imageUrl: string | null;
  backImageUrl: string | null;
  searchOnly?: boolean;
}

export function CardDetailImageUpload({ cardId, cardTitle, imageUrl, backImageUrl, searchOnly = false }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const source = cardTitle === 'yugioh' ? 'yugioh' : cardTitle === 'onepiece' ? 'onepiece' : 'pokemon';

  const fetchResults = useCallback(async (q: string, p: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&source=${source}&page=${p}`);
      const data = await res.json();
      if (append) {
        setResults((prev) => [...prev, ...(data.results || [])]);
      } else {
        setResults(data.results || []);
      }
      setTotalCount(data.totalCount || 0);
      setPage(p);
    } catch {
      if (!append) setResults([]);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [source]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      setTotalCount(0);
      return;
    }
    setOpen(true);
    debounceRef.current = setTimeout(() => fetchResults(query, 1, false), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchResults]);

  const handleImageChange = async (side: 'front' | 'back', url: string | null) => {
    if (side === 'front') {
      await updateCardImages(cardId, { image_url: url });
    } else {
      await updateCardImages(cardId, { back_image_url: url });
    }
  };

  const handleSearchSelect = async (result: SearchResult) => {
    await updateCardImages(cardId, { image_url: result.imageUrl });
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  if (!userId) return null;

  return (
    <div className="space-y-3">
      {!searchOnly && (
        <>
          <p className="text-xs font-semibold text-muted">カード画像</p>
          <div className="flex gap-4">
            <CardImageUpload
              label="表面"
              currentUrl={imageUrl}
              onUrlChange={(url) => handleImageChange('front', url)}
              userId={userId}
              side="front"
            />
            <CardImageUpload
              label="裏面"
              currentUrl={backImageUrl}
              onUrlChange={(url) => handleImageChange('back', url)}
              userId={userId}
              side="back"
            />
          </div>
        </>
      )}

      {/* コンパクト検索 */}
      <div>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="英語カード名で画像検索..."
            className="w-full rounded-lg border border-border px-3 py-1.5 pr-8 text-xs outline-none focus:border-primary"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          </div>
        </div>

        <p className="mt-1 text-[10px] text-muted">※ ポケモン・遊戯王・ワンピースの英語版カードに対応。その他は画像アップロードをご利用ください。</p>

        {open && (
          <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-border bg-card-bg p-2">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs text-muted">{loading ? '検索中...' : `${results.length}件`}</p>
              <button onClick={() => { setOpen(false); setQuery(''); }} className="text-muted hover:text-foreground">
                <X size={14} />
              </button>
            </div>

            {!loading && results.length === 0 && query.length >= 2 && (
              <p className="py-3 text-center text-xs text-muted">見つかりません</p>
            )}

            <div className="grid grid-cols-4 gap-1.5">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSearchSelect(r)}
                  className="flex flex-col items-center gap-0.5 rounded border border-border p-1 hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  <div className="relative h-16 w-12 overflow-hidden rounded">
                    {r.thumbnailUrl ? (
                      <Image src={r.thumbnailUrl} alt={r.name} fill className="object-contain" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center text-[8px] text-white/20">No img</div>
                    )}
                  </div>
                  <p className="w-full truncate text-center text-[10px]">{r.name}</p>
                </button>
              ))}
            </div>

            {results.length < totalCount && (
              <button
                onClick={() => fetchResults(query, page + 1, true)}
                disabled={loadingMore}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs text-muted hover:bg-white/5 hover:text-foreground transition-colors disabled:opacity-50"
              >
                {loadingMore ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown size={12} />}
                {loadingMore ? '読み込み中...' : 'もっと見る'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
