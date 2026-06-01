import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import usePageTitle from '../hooks/usePageTitle';

export default function Cart() {
  const { items, removeItem, updateQuantity, total, count } = useCart();
  usePageTitle('Cart');

  return (
    <Layout>
      <div className="container section">
        <h1>Your Cart ({count} items)</h1>

        {items.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="btn btn-primary">Browse products</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <ul className="cart-list">
              {items.map((item, index) => (
                <li key={`${item._id}-${index}`} className="cart-row">
                  <Link to={`/shop/${item._id}`}>
                    <img src={item.imageUrl} alt="" loading="lazy" onError={(e) => { e.target.src = '/images/black.png'; }} />
                  </Link>
                  <div className="cart-row-info">
                    <Link to={`/shop/${item._id}`}><strong>{item.name}</strong></Link>
                    <span className="price">₹{Number(item.price).toLocaleString('en-IN')} each</span>
                    <div className="qty-control qty-control--sm">
                      <button type="button" onClick={() => updateQuantity(index, (item.quantity || 1) - 1)} disabled={(item.quantity || 1) <= 1}>−</button>
                      <span>{item.quantity || 1}</span>
                      <button type="button" onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-row-right">
                    <span className="price">₹{(Number(item.price) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="cart-summary-panel">
              <h2>Summary</h2>
              <p>Subtotal: <strong>₹{total.toLocaleString('en-IN')}</strong></p>
              <p className="muted">Shipping calculated at checkout</p>
              <Link to="/checkout" className="btn btn-primary btn-block">Proceed to checkout</Link>
              <Link to="/shop" className="btn btn-outline btn-block">Continue shopping</Link>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
