import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import usePageTitle from '../hooks/usePageTitle';
import { orderApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Account() {
  const { user, loading } = useAuth();
  const { items: wishlist, remove: removeWishlist } = useWishlist();
  const { addItem } = useCart();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('orders');
  const [fetching, setFetching] = useState(true);

  usePageTitle('My account');

  useEffect(() => {
    if (!user) return;
    orderApi.mine()
      .then((res) => setOrders(res.data || []))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading) {
    return <Layout><div className="container section"><p className="muted">Loading…</p></div></Layout>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <div className="container section">
        <h1>My account</h1>
        <p className="muted">Welcome back, {user.name}</p>

        <div className="account-tabs">
          <button type="button" className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
            Orders ({orders.length})
          </button>
          <button type="button" className={tab === 'wishlist' ? 'active' : ''} onClick={() => setTab('wishlist')}>
            Wishlist ({wishlist.length})
          </button>
          <button type="button" className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>
            Profile
          </button>
        </div>

        {tab === 'orders' && (
          <div className="account-panel">
            {fetching && <p className="muted">Loading orders…</p>}
            {!fetching && orders.length === 0 && (
              <div className="empty-state">
                <p>No orders yet.</p>
                <Link to="/shop" className="btn btn-primary">Start shopping</Link>
              </div>
            )}
            <ul className="order-history">
              {orders.map((order) => (
                <li key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                      <time className="muted">{new Date(order.createdAt).toLocaleDateString()}</time>
                    </div>
                    <span className={`status-badge status-${order.status}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <p>{order.items?.length || 0} item(s) — ₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                  <Link to={`/order-success/${order._id}`} className="btn btn-sm btn-outline">View details</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'wishlist' && (
          <div className="account-panel">
            {wishlist.length === 0 ? (
              <div className="empty-state">
                <p>Your wishlist is empty.</p>
                <Link to="/shop" className="btn btn-primary">Browse products</Link>
              </div>
            ) : (
              <div className="product-grid">
                {wishlist.map((p) => (
                  <div key={p._id} className="wishlist-item-wrap">
                    <ProductCard product={p} onAdd={addItem} />
                    <button type="button" className="btn btn-sm btn-danger wishlist-remove" onClick={() => removeWishlist(p._id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div className="account-panel form-card profile-card">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
