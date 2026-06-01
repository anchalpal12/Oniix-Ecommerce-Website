import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import usePageTitle from '../hooks/usePageTitle';
import { orderApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState('');

  usePageTitle('Order confirmed');

  useEffect(() => {
    if (order || !user) return;
    orderApi.get(id)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.message));
  }, [id, user, order]);

  const items = order?.items || [];

  return (
    <Layout showAnnouncement={false}>
      <div className="container section narrow order-success">
        <div className="success-icon">✓</div>
        <h1>Thank you for your order!</h1>
        <p className="muted">Your order has been received and is being processed.</p>

        {order && (
          <div className="order-receipt">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Total:</strong> ₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
            <p><strong>Payment:</strong> {order.paymentMethod?.toUpperCase()} — {order.paymentStatus}</p>
            <p><strong>Delivery to:</strong> {order.address}</p>
            <ul className="receipt-items">
              {items.map((item, i) => (
                <li key={i}>{item.name} × {item.quantity || 1} — ₹{item.price}</li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="order-success-actions">
          <Link to="/account" className="btn btn-primary">View my orders</Link>
          <Link to="/shop" className="btn btn-outline">Continue shopping</Link>
        </div>
      </div>
    </Layout>
  );
}
