import { Link } from 'react-router-dom';
import { formatINR } from './StatCard';

export default function LowStockList({ products = [] }) {
  if (!products.length) {
    return (
      <div className="admin-empty-state admin-empty-state--ok">
        <span aria-hidden>✓</span>
        <p>All products are well stocked</p>
      </div>
    );
  }

  return (
    <ul className="low-stock-list">
      {products.map((p) => (
        <li key={p._id} className={p.stock === 0 ? 'critical' : ''}>
          <div>
            <strong>{p.name}</strong>
            <span className="muted">{p.category}</span>
          </div>
          <div className="low-stock-meta">
            <span className={`stock-pill${p.stock <= 5 ? ' stock-pill--warn' : ''}`}>
              {p.stock} left
            </span>
            <span>{formatINR(p.price)}</span>
          </div>
        </li>
      ))}
      <Link to="/admin/products" className="admin-panel-link">Manage inventory →</Link>
    </ul>
  );
}
