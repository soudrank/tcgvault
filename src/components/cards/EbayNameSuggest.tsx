'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';

interface EbayItem {
  title: string;
  price: number;
  currency: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelectPrice?: (price: number) => void;
  label?: string;
  note?: string;
}

export function EbayNameSuggest({ value, onChange, onSelectPrice, label = 'カード名', note }: Props) {
  const [suggestions, setSuggestions] = useState<EbayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ebay/sold-prices?cardName=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.items || []);
      setOpen(true);
    } catch {
      setSuggestions([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!userTyping || value.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, userTyping, fetchSuggestions]);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (item: EbayItem) => {
    setUserTyping(false);
    onChange(item.title);
    if (onSelectPrice && item.price > 0) {
      onSelectPrice(item.price);
    }
    setOpen(false);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);

  return (
    <div ref={wrapperRef} className="relative z-50">
      <label className="field-label">{label}</label>
      <div className="relative">
        <Icon
          icon="mdi:magnify"
          width={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/15"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => { setUserTyping(true); onChange(e.target.value); }}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder="カード名で検索して相場を取得"
          className="fi"
          style={{ paddingLeft: 34 }}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="spinner" />
          </div>
        )}
      </div>
      {note && <div className="field-note">{note}</div>}

      {open && suggestions.length > 0 && (
        <div className="ac-dropdown show">
          {suggestions.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(item)}
              className="ac-item w-full text-left"
            >
              <span className="ac-name flex-1 line-clamp-2">{item.title}</span>
              <span className="ac-price shrink-0 ml-2">
                {formatPrice(item.price)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
