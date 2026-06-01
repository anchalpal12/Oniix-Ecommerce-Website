import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatINR } from '../../components/admin/StatCard';
import { orderApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

const STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function getItems(order) {
  return order.items?.length ? order.items : order.cart || [];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const load = useCallback((page = 1) => {
    setLoading(true);
    orderApi
      .all({ page, limit: 50 })
      .then((res) => {
        setOrders(res.data?.orders || []);
        setPagination(res.data?.pagination || { page: 1, limit: 50, total: 0, pages: 1 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || (o.status || 'pending') === statusFilter;
      const matchSearch =
        !q ||
        o.name?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o._id?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await orderApi.updateStatus(id, status);
      toast('Order status updated', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this order permanently?')) return;
    try {
      await orderApi.remove(id);
      toast('Order deleted', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const pendingCount = orders.filter((o) => (o.status || 'pending') === 'pending').length;

  return (
    <AdminLayout
      title="Orders"
      subtitle={`${pagination.total || orders.length} total · ${pendingCount} pending on this page`}
      actions={
        <button type="button" className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          ↻ Refresh
        </button>
      }
    >
      {error && <p className="error-text">{error}</p>}

      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="Search by customer, email, or order ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-filter-pills">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`admin-pill${statusFilter === s ? ' active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel admin-panel--flush">
        {loading ? (
          <p className="admin-empty-hint">Loading orders…</p>
        ) : filtered.length === 0 ? (
          <p className="admin-empty-hint">No orders match your filters.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <strong>{o.name}</strong>
                      <span className="admin-table-sub">{o.email}</span>
                    </td>
                    <td className="admin-table-items">
                      {getItems(o).map((i) => i.name).join(', ')}
                    </td>
                    <td><strong>{formatINR(o.totalAmount)}</strong></td>
                    <td>
                      <span className="muted">{(o.paymentMethod || 'cod').toUpperCase()}</span>
                    </td>
                    <td>
                      <select
                        className="admin-select"
                        value={o.status || 'pending'}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        {STATUSES.filter((s) => s !== 'all').map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(o._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
