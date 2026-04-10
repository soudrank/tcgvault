import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function CardDetailLoading() {
  return (
    <div
      style={{ padding: '24px 16px 0', maxWidth: 1000, margin: '0 auto' }}
      className="md:px-6 lg:px-8"
    >
      {/* Back link */}
      <div className="mb-6" style={{ marginTop: 8 }}>
        <Link
          href="/portfolio"
          className="flex items-center gap-2 text-white/30 text-xs"
          style={{ width: 'fit-content' }}
        >
          <Icon icon="mdi:arrow-left" width={16} />
          カード一覧に戻る
        </Link>
      </div>

      {/* Card Header skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mb-6">
        {/* Card image */}
        <div className="skeleton" style={{ width: '100%', aspectRatio: '0.72' }} />

        {/* Card info */}
        <div>
          <div className="skeleton" style={{ width: '70%', height: 28, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '40%', height: 12, marginBottom: 24 }} />

          <div className="panel mb-4" style={{ padding: 16 }}>
            <div className="skeleton" style={{ width: '30%', height: 11, marginBottom: 14 }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ width: '100%', height: 14, marginBottom: 10 }}
              />
            ))}
          </div>

          <div className="panel" style={{ padding: 16 }}>
            <div className="skeleton" style={{ width: '30%', height: 11, marginBottom: 14 }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ width: '100%', height: 14, marginBottom: 10 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="panel mb-6" style={{ padding: 20 }}>
        <div className="skeleton" style={{ width: '30%', height: 12, marginBottom: 20 }} />
        <div className="skeleton" style={{ width: '100%', height: 220 }} />
      </div>

      <div className="panel" style={{ padding: 20 }}>
        <div className="skeleton" style={{ width: '30%', height: 12, marginBottom: 20 }} />
        <div className="skeleton" style={{ width: '100%', height: 180 }} />
      </div>
    </div>
  );
}
