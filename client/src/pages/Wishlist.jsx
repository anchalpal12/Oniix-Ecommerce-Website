import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ProductCard';
import usePageTitle from '../hooks/usePageTitle';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
  const { items } = useWishlist();
  const { addItem } = useCart();

  usePageTitle('Wishlist');

  return (
    <Layout>
      <div className="container section">
        <h1>Wishlist ({items.length})</h1>
        {items.length === 0 ? (
          <div className="empty-state">
            <p>Save products you love for later.</p>
            <Link to="/shop" className="btn btn-primary">Browse shop</Link>
          </div>
        ) : (
          <div className="product-grid">
            {items.map((p) => (
              <ProductCard key={p._id} product={p} onAdd={addItem} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
