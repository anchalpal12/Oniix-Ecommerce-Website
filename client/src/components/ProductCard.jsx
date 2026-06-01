import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import StarRating from './ui/StarRating';

function savingsPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export default function ProductCard({ product, onAdd, variant = 'default' }) {
  const { isWishlisted, toggle } = useWishlist();
  const { toast } = useToast();
  const isShop = variant === 'shop';
  const savings = savingsPercent(product.price, product.compareAtPrice);

  const imgSrc =
    product.imageUrl?.startsWith('http') || product.imageUrl?.startsWith('data:')
      ? product.imageUrl
      : product.imageUrl?.startsWith('/')
        ? product.imageUrl
        : `/images/${product.imageUrl}`;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) {
      toast('Out of stock', 'error');
      return;
    }
    onAdd(product);
    toast('Added to cart', 'success');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
    toast(isWishlisted(product._id) ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
  };

  return (
    <motion.article
      className={`product-card${isShop ? ' product-card--shop' : ''}`}
      whileHover={isShop ? { y: -4 } : { y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <Link to={`/shop/${product._id}`} className="product-card-link">
        <div className="product-image-wrap">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={(e) => { e.target.src = '/images/black.png'; }}
          />
          {isShop && (
            <div className="product-image-overlay" aria-hidden>
              <span>View details</span>
            </div>
          )}
          {product.badge && (
            <span className={`product-badge product-badge--${product.badge.toLowerCase().replace(/\s+/g, '-')}`}>
              {product.badge}
            </span>
          )}
          {savings != null && (
            <span className="product-savings-badge">−{savings}%</span>
          )}
          {product.stock != null && product.stock < 10 && product.stock > 0 && (
            <span className="stock-badge">Only {product.stock} left</span>
          )}
          {product.stock === 0 && <span className="stock-badge stock-badge--out">Sold out</span>}
          <button
            type="button"
            className={`wishlist-heart ${isWishlisted(product._id) ? 'active' : ''}`}
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
          >
            {isWishlisted(product._id) ? '♥' : '♡'}
          </button>
        </div>
        <div className="product-body">
          <span className="product-category">{product.category}</span>
          <h3>{product.name}</h3>
          {isShop && (product.rating || product.reviewCount) ? (
            <StarRating
              rating={product.rating ?? 4.5}
              reviewCount={product.reviewCount}
              size="sm"
            />
          ) : null}
          <p className="product-desc">
            {product.description?.length > 80
              ? `${product.description.slice(0, 80)}…`
              : product.description}
          </p>
          <div className="product-footer">
            <div className="product-price-row">
              <span className="price">₹{Number(product.price).toLocaleString('en-IN')}</span>
              {product.compareAtPrice > product.price && (
                <span className="price-compare">
                  ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      <button
        type="button"
        className="btn btn-primary btn-sm product-add-btn"
        onClick={handleAdd}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Sold out' : 'Add to Cart'}
      </button>
    </motion.article>
  );
}
