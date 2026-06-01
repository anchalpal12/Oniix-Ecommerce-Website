export function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function StatCard({ label, value, sub, trend, icon, accent }) {
  const trendUp = trend > 0;
  const trendDown = trend < 0;
  const showTrend = trend != null && !Number.isNaN(trend);

  return (
    <article className={`admin-kpi${accent ? ` admin-kpi--${accent}` : ''}`}>
      <div className="admin-kpi-top">
        <span className="admin-kpi-label">{label}</span>
        {icon && <span className="admin-kpi-icon" aria-hidden>{icon}</span>}
      </div>
      <strong className="admin-kpi-value">{value}</strong>
      <div className="admin-kpi-foot">
        {sub && <span className="admin-kpi-sub">{sub}</span>}
        {showTrend && (
          <span className={`admin-kpi-trend${trendUp ? ' up' : ''}${trendDown ? ' down' : ''}`}>
            {trendUp ? '↑' : trendDown ? '↓' : '→'} {Math.abs(trend)}% vs last month
          </span>
        )}
      </div>
    </article>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="admin-dashboard-grid">
      <div className="admin-kpi-row">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="admin-kpi admin-skeleton" />
        ))}
      </div>
      <div className="admin-panel admin-skeleton admin-skeleton--tall" />
      <div className="admin-panel admin-skeleton admin-skeleton--tall" />
    </div>
  );
}
