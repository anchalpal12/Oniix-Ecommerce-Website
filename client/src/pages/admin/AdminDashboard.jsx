import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard, { DashboardSkeleton, formatINR } from '../../components/admin/StatCard';
import RevenueChart from '../../components/admin/RevenueChart';
import StatusBreakdown from '../../components/admin/StatusBreakdown';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import LowStockList from '../../components/admin/LowStockList';
import { adminApi } from '../../api/client';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    adminApi
      .dashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = data?.kpis;

  return (
    <AdminLayout
      title="Overview"
      subtitle="Real-time store performance and operations"
      actions={
        <button type="button" className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </button>
      }
    >
      {error && (
        <div className="admin-alert admin-alert--error">
          {error}
          <button type="button" className="btn btn-sm btn-primary" onClick={load}>Retry</button>
          </div>
        )}

      {loading && !data ? (
        <DashboardSkeleton />
      ) : data ? (
        <div className="admin-dashboard-grid">
          <div className="admin-kpi-row">
            <StatCard
              label="Total revenue"
              value={formatINR(kpis.revenue.total)}
              sub={`${formatINR(kpis.revenue.thisMonth)} this month`}
              trend={kpis.revenue.trend}
              icon="₹"
              accent="orange"
            />
            <StatCard
              label="Orders"
              value={kpis.orders.total.toLocaleString('en-IN')}
              sub={`${kpis.orders.thisMonth} this month`}
              trend={kpis.orders.trend}
              icon="☰"
              accent="blue"
            />
            <StatCard
              label="Customers"
              value={kpis.users.total.toLocaleString('en-IN')}
              sub={`+${kpis.users.newThisWeek} this week`}
              icon="👤"
              accent="green"
            />
            <StatCard
              label="Products"
              value={kpis.products.total.toLocaleString('en-IN')}
              sub={kpis.products.lowStock ? `${kpis.products.lowStock} low stock` : 'Inventory healthy'}
              icon="▣"
              accent="purple"
            />
          </div>

          <div className="admin-charts-row">
            <section className="admin-panel">
              <div className="admin-panel-head">
                <h2>Revenue · last 7 days</h2>
              </div>
              <RevenueChart data={data.revenueChart} />
            </section>

            <section className="admin-panel">
              <div className="admin-panel-head">
                <h2>Orders by status</h2>
              </div>
              <StatusBreakdown data={data.ordersByStatus} />
            </section>
          </div>

          <div className="admin-charts-row">
            <section className="admin-panel">
              <div className="admin-panel-head">
                <h2>Recent orders</h2>
              </div>
              <RecentOrdersTable orders={data.recentOrders} />
            </section>

            <section className="admin-panel">
              <div className="admin-panel-head">
                <h2>Low stock alerts</h2>
                {kpis.products.lowStock > 0 && (
                  <span className="admin-badge admin-badge--warn">{kpis.products.lowStock} items</span>
                )}
              </div>
              <LowStockList products={data.lowStockProducts} />
            </section>
          </div>

          <div className="admin-quick-actions">
            <Link to="/admin/orders" className="admin-action-card">
              <span>Process orders</span>
              <strong>{data.ordersByStatus.pending ?? 0} pending</strong>
            </Link>
            <Link to="/admin/products" className="admin-action-card">
              <span>Manage catalog</span>
              <strong>{kpis.products.total} SKUs</strong>
            </Link>
            <Link to="/admin/users" className="admin-action-card">
              <span>User management</span>
              <strong>{kpis.users.total} accounts</strong>
            </Link>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
