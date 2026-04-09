'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface CardSearchResult {
  id: string;
  name: string;
  nameEn: string;
  setName: string;
  number: string;
  imageUrl: string;
  thumbnailUrl: string;
  marketPriceUsd: number | null;
  source: 'pokemon' | 'yugioh';
}

interface Props {
  onSelect: (imageUrl: string, cardName: string, marketPriceJpy: number | null) => void;
  currentImageUrl?: string | null;
}

const USD_TO_JPY = 150;

export default function CardImageSearch({ onSelect, currentImageUrl }: Props) {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'pokemon' | 'yugioh'>('pokemon');
  const [results, setResults] = useState<CardSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchResults = useCallback(async (q: string, s: string, p: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&source=${s}&page=${p}`);
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
  }, []);

  // 入力のたびにデバウンスして自動検索
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      setTotalCount(0);
      return;
    }

    setOpen(true);

    debounceRef.current = setTimeout(() => {
      fetchResults(query, source, 1, false);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, source, fetchResults]);

  const handleLoadMore = () => {
    fetchResults(query, source, page + 1, true);
  };

  const handleSelect = (result: CardSearchResult) => {
    const priceJpy = result.marketPriceUsd
      ? Math.round(result.marketPriceUsd * USD_TO_JPY)
      : null;
    onSelect(result.imageUrl, result.name, priceJpy);
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  const hasMore = results.length < totalCount;

  return (
    <div className="rounded-xl border border-border bg-card-bg p-6 card-glow">
      <h2 className="mb-4 text-sm font-semibold text-muted">カード画像検索</h2>

      {/* 現在の画像 */}
      {currentImageUrl && (
        <div className="mb-4 flex flex-col items-center gap-2">
          <div className="relative h-48 w-36 overflow-hidden rounded-lg border border-border">
            <Image
              src={currentImageUrl}
              alt="カード画像"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={() => onSelect('', '', null)}
            className="flex items-center gap-1 rounded-md px-3 py-1 text-xs text-danger hover:bg-danger/10 transition-colors"
          >
            <X size={14} />
            画像を削除
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as 'pokemon' | 'yugioh')}
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none"
        >
          <option value="pokemon">ポケモンカード</option>
          <option value="yugioh">遊戯王</option>
        </select>

        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="カード名を検索（例: リザードン, pikachu）"
            className="w-full rounded-lg border border-border px-3 py-2 pr-10 text-sm outline-none focus:border-primary"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </div>
        </div>
      </div>

      {/* 検索結果 */}
      {open && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-muted">
              {loading ? '検索中...' : `${results.length}件 / ${totalCount}件`}
            </p>
            <button onClick={() => { setOpen(false); setQuery(''); }} className="text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="group flex flex-col items-center gap-1 rounded-lg border border-border p-2 hover:border-primary hover:bg-primary/10 transition-colors"
                  >
                    <div className="relative h-28 w-20 overflow-hidden rounded sm:h-36 sm:w-24">
                      <Image
                        src={result.thumbnailUrl}
                        alt={result.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <p className="w-full truncate text-center text-xs">{result.name}</p>
                    {result.setName && (
                      <p className="w-full truncate text-center text-xs text-muted">{result.setName}</p>
                    )}
                    {result.marketPriceUsd && (
                      <p className="text-xs font-medium text-success">
                        ≈¥{Math.round(result.marketPriceUsd * USD_TO_JPY).toLocaleString()}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {loadingMore ? '読み込み中...' : 'もっと見る'}
                </button>
              )}
            </>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <p className="py-6 text-center text-sm text-muted">該当するカードが見つかりません</p>
          )}
        </div>
      )}
    </div>
  );
}
