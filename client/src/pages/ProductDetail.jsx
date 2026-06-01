import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ProductCard from '../components/ProductCard';
import StarRating, { StarInput } from '../components/ui/StarRating';
import ScrollReveal from '../components/ui/ScrollReveal';
import usePageTitle from '../hooks/usePageTitle';
import { productApi, reviewApi } from '../api/client';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState({ reviews: [], avgRating: 0, count: 0 });
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  usePageTitle(product?.name);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      productApi.get(id),
      reviewApi.forProduct(id),
      productApi.list({ limit: 4 }),
    ])
      .then(([prodRes, revRes, listRes]) => {
        if (cancelled) return;
        setProduct(prodRes.data);
        setReviews(revRes.data);
        setRelated(
          (listRes.data.products || []).filter((p) => p._id !== id).slice(0, 3)
        );
      })
      .catch(() => toast('Product not found', 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, toast]);

  const handleAdd = () => {
    if (!product) return;
    if (product.stock === 0) {
      toast('Out of stock', 'error');
      return;
    }
    addItem(product, qty);
    toast(`Added ${qty} to cart`, 'success');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast('Please log in to leave a review', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await reviewApi.create({ productId: id, ...reviewForm, userName: user.name });
      const revRes = await reviewApi.forProduct(id);
      setReviews(revRes.data);
      setReviewForm({ rating: 5, comment: '' });
      toast('Review submitted', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container section"><p className="muted">Loading product…</p></div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container section empty-state">
          <h1>Product not found</h1>
          <Link to="/shop" className="btn btn-primary">Back to shop</Link>
        </div>
      </Layout>
    );
  }

  const imgSrc = product.imageUrl?.startsWith('data:') || product.imageUrl?.startsWith('http')
    ? product.imageUrl
    : product.imageUrl;

  return (
    <Layout>
      <div className="container section">
        <Breadcrumbs items={[{ label: 'Shop', to: '/shop' }, { label: product.name }]} />

        <div className="pdp-grid">
          <motion.div
            className="pdp-gallery"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img src={imgSrc} alt={product.name} onError={(e) => { e.target.src = '/images/black.png'; }} />
            <div className="pdp-trust">
              <span>✓ Free shipping over ₹5,000</span>
              <span>✓ 2-year warranty</span>
              <span>✓ 30-day returns</span>
            </div>
          </motion.div>

          <div className="pdp-info">
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>
            <div className="pdp-rating-row">
              <StarRating rating={reviews.avgRating} />
              <span className="muted">({reviews.count} reviews)</span>
            </div>
            <p className="pdp-price">₹{Number(product.price).toLocaleString('en-IN')}</p>
            <p className="pdp-desc">{product.description}</p>

            <div className="pdp-stock">
              {product.stock > 0 ? (
                <span className="in-stock">In stock — {product.stock} available</span>
              ) : (
                <span className="out-of-stock">Out of stock</span>
              )}
            </div>

            <div className="pdp-actions">
              <div className="qty-control">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} aria-label="Increase">+</button>
              </div>
              <button type="button" className="btn btn-primary btn-lg" onClick={handleAdd} disabled={!product.stock}>
                Add to Cart
              </button>
              <button
                type="button"
                className={`btn btn-outline wishlist-btn ${isWishlisted(product._id) ? 'active' : ''}`}
                onClick={() => toggle(product)}
                aria-label="Toggle wishlist"
              >
                {isWishlisted(product._id) ? '♥ Saved' : '♡ Wishlist'}
              </button>
            </div>
          </div>
        </div>

        <section className="pdp-reviews section-block">
          <h2>Customer reviews</h2>
          {reviews.reviews.length === 0 && <p className="muted">No reviews yet. Be the first!</p>}
          <ul className="review-list">
            {reviews.reviews.map((r) => (
              <li key={r._id} className="review-item">
                <div className="review-header">
                  <strong>{r.userName}</strong>
                  <StarRating rating={r.rating} size="sm" />
                </div>
                <p>{r.comment}</p>
                <time className="muted">{new Date(r.createdAt).toLocaleDateString()}</time>
              </li>
            ))}
          </ul>

          {user && (
            <form className="form-card review-form" onSubmit={submitReview}>
              <h3>Write a review</h3>
              <StarInput value={reviewForm.rating} onChange={(rating) => setReviewForm({ ...reviewForm, rating })} />
              <label>
                Comment
                <textarea
                  required
                  rows={3}
                  maxLength={500}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          )}
        </section>

        {related.length > 0 && (
          <section className="section-block">
            <h2>You may also like</h2>
            <div className="product-grid">
              {related.map((p) => (
                <ScrollReveal key={p._id}>
                  <ProductCard product={p} onAdd={addItem} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
