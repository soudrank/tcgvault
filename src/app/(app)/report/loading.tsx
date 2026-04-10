import { Icon } from '@iconify/react';

export default function ReportLoading() {
  return (
    <div
      style={{ padding: '24px 16px 0', maxWidth: 960, margin: '0 auto' }}
      className="md:px-6 lg:px-8"
    >
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="mb-6" style={{ marginTop: 8 }}>
          <div className="flex items-center gap-2 mb-1">
            <Icon icon="mdi:file-chart-outline" width={16} className="text-white/12" />
            <span className="text-[10px] text-white/18 tracking-wider uppercase font-display">
              Annual Report
            </span>
          </div>
          <h1 className="font-bold text-xl md:text-2xl tracking-tight text-white/85">
            年間収支レポート
          </h1>
        </div>

        {/* P&L panel skeleton */}
        <div className="panel mb-6" style={{ padding: 20 }}>
          <div className="skeleton" style={{ width: '30%', height: 12, marginBottom: 18 }} />
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ width: '100%', height: 16, marginBottom: 12 }}
            />
          ))}
          <div
            className="skeleton"
            style={{ width: '100%', height: 28, marginTop: 8 }}
          />
        </div>

        {/* Tax box skeleton */}
        <div className="panel mb-6" style={{ padding: 20 }}>
          <div className="skeleton" style={{ width: '40%', height: 12, marginBottom: 14 }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ width: '100%', height: 12, marginBottom: 10 }}
            />
          ))}
        </div>

        {/* CSV button skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '100%', height: 60 }} />
          ))}
        </div>

        {/* Sold table skeleton */}
        <div className="panel" style={{ padding: 20 }}>
          <div className="skeleton" style={{ width: '30%', height: 12, marginBottom: 18 }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ width: '100%', height: 28, marginBottom: 8 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
