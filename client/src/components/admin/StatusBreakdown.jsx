const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function StatusBreakdown({ data = {} }) {
  const entries = Object.entries(data).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, c]) => sum + c, 0) || 1;

  if (!entries.length) {
    return <p className="admin-empty-hint">No orders yet</p>;
  }

  return (
    <div className="status-breakdown">
      <div className="status-breakdown-bar">
        {entries.map(([status, count]) => (
          <div
            key={status}
            className="status-breakdown-segment"
            style={{
              width: `${(count / total) * 100}%`,
              background: STATUS_COLORS[status] || '#94a3b8',
            }}
            title={`${status}: ${count}`}
          />
        ))}
      </div>
      <ul className="status-breakdown-legend">
        {entries.map(([status, count]) => (
          <li key={status}>
            <span className="status-dot" style={{ background: STATUS_COLORS[status] }} />
            <span className="status-breakdown-name">{status}</span>
            <strong>{count}</strong>
            <span className="muted">{Math.round((count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
