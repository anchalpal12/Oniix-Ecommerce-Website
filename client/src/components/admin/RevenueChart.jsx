import { formatINR } from './StatCard';

export default function RevenueChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="revenue-chart">
      <div className="revenue-chart-bars">
        {data.map((day) => {
          const height = Math.max(4, (day.revenue / max) * 100);
          return (
            <div key={day.date} className="revenue-chart-col">
              <div className="revenue-chart-bar-wrap" title={`${formatINR(day.revenue)} · ${day.orders} orders`}>
                <div className="revenue-chart-bar" style={{ height: `${height}%` }} />
              </div>
              <span className="revenue-chart-label">{day.label}</span>
            </div>
          );
        })}
      </div>
      {data.every((d) => d.revenue === 0) && (
        <p className="admin-empty-hint">No revenue in the last 7 days</p>
      )}
    </div>
  );
}
