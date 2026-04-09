'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { uploadCardImage } from '@/lib/supabase/storage';

interface Props {
  label: string;
  currentUrl: string | null;
  onUrlChange: (url: string | null) => void;
  userId: string;
  side: 'front' | 'back';
}

export function CardImageUpload({ label, currentUrl, onUrlChange, userId, side }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const rawUrl = preview || currentUrl;
  const displayUrl = rawUrl && rawUrl.includes('onepiece-cardgame.com')
    ? `/api/proxy-image?url=${encodeURIComponent(rawUrl)}`
    : rawUrl;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示（古いURLを解放してから新規作成）
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreview(objectUrl);

    setUploading(true);
    try {
      const publicUrl = await uploadCardImage(file, userId, side);
      onUrlChange(publicUrl);
      setPreview(null);
    } catch (err) {
      console.error(err);
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onUrlChange(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted">{label}</p>
      {displayUrl ? (
        <div className="relative inline-block">
          <img
            src={displayUrl}
            alt={label}
            className="h-40 w-auto rounded-lg border border-border object-contain"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-40 w-28 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          ) : (
            <>
              <ImageIcon size={24} />
              <span className="text-xs"><Upload size={12} className="inline mr-1" />選択</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
