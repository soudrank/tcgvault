export default function DashboardMarketSkeleton() {
  return (
    <>
      {/* Summary Cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 md:mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card">
            <div className="skeleton" style={{ width: '60%', height: 10, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: '80%', height: 22, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: '40%', height: 10 }} />
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
    </>
  );
}
