import { Icon } from '@iconify/react';

export default function PortfolioLoading() {
  return (
    <div
      style={{ padding: '24px 16px 0', maxWidth: 1100, margin: '0 auto' }}
      className="md:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5 md:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon icon="mdi:cards-outline" width={16} className="text-white/12" />
            <span className="text-[10px] text-white/18 tracking-wider uppercase font-display">
              Cards
            </span>
          </div>
          <h1 className="font-bold text-xl md:text-2xl tracking-tight text-white/85">
            カード一覧
          </h1>
          <div className="skeleton" style={{ width: 80, height: 11, marginTop: 6 }} />
        </div>
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="panel" style={{ padding: 12 }}>
            <div
              className="skeleton"
              style={{ width: '100%', aspectRatio: '0.72', marginBottom: 10 }}
            />
            <div className="skeleton" style={{ width: '80%', height: 11, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: '50%', height: 10 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
