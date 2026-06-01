import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatINR } from './StatCard';

export default function RecentOrdersTable({ orders = [] }) {
  if (!orders.length) {
    return <p className="admin-empty-hint">No orders yet. They&apos;ll show up here.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>
                <strong>{o.name}</strong>
                <span className="admin-table-sub">{o.email}</span>
              </td>
              <td>{formatINR(o.totalAmount)}</td>
              <td><StatusBadge status={o.status} /></td>
              <td className="muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/admin/orders" className="admin-panel-link">View all orders →</Link>
    </div>
  );
}
