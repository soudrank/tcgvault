import { Icon } from '@iconify/react';

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-6 lg:px-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-5 md:mb-7" style={{ paddingTop: 8 }}>
        <div className="flex items-center gap-2 mb-1">
          <Icon icon="mdi:view-dashboard-outline" width={16} className="text-white/12" />
          <span className="text-[10px] text-white/18 tracking-wider uppercase font-display">
            Dashboard
          </span>
        </div>
        <h1 className="font-body font-700 text-xl md:text-2xl tracking-tight text-white/85">
          ダッシュボード
        </h1>
      </div>

      {/* Summary Cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel" style={{ padding: '16px 18px' }}>
            <div className="skeleton" style={{ width: '60%', height: 10, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: '80%', height: 22 }} />
          </div>
        ))}
      </div>

      {/* Chart + Recent skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-5">
        <div className="lg:col-span-2 panel" style={{ padding: 20 }}>
          <div className="skeleton" style={{ width: '40%', height: 12, marginBottom: 20 }} />
          <div className="skeleton" style={{ width: '100%', height: 240 }} />
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <div className="skeleton" style={{ width: '50%', height: 12, marginBottom: 20 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ width: '100%', height: 40, marginBottom: 10 }}
            />
          ))}
        </div>
      </div>

      {/* Grading section skeleton */}
      <div className="panel" style={{ padding: 20 }}>
        <div className="skeleton" style={{ width: '30%', height: 12, marginBottom: 20 }} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '100%', height: 80 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
