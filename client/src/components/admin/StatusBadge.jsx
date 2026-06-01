const STATUS_STYLES = {
  pending: 'status-badge--pending',
  confirmed: 'status-badge--confirmed',
  shipped: 'status-badge--shipped',
  delivered: 'status-badge--delivered',
  cancelled: 'status-badge--cancelled',
  paid: 'status-badge--delivered',
  failed: 'status-badge--cancelled',
  refunded: 'status-badge--pending',
  admin: 'status-badge--confirmed',
  user: 'status-badge--pending',
};

export default function StatusBadge({ status }) {
  const key = (status || 'pending').toLowerCase();
  return (
    <span className={`status-badge ${STATUS_STYLES[key] || 'status-badge--pending'}`}>
      {key}
    </span>
  );
}
