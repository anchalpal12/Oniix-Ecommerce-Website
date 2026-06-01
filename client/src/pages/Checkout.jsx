import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';
import { orderApi } from '../api/client';
import { loadStripe } from '@stripe/stripe-js';

const SHIPPING = 99;
const FREE_SHIPPING_MIN = 5000;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  usePageTitle('Checkout');

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [stripeCompleting, setStripeCompleting] = useState(false);
  const [error, setError] = useState('');
  const stripeHandledRef = useRef(null);

  const stripeStatus = searchParams.get('stripe');
  const stripeSessionId = searchParams.get('session_id');
  const isStripeSuccessReturn = stripeStatus === 'success' && Boolean(stripeSessionId);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: user.name, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (!isStripeSuccessReturn || stripeHandledRef.current === stripeSessionId) return;

    stripeHandledRef.current = stripeSessionId;
    setStripeCompleting(true);

    orderApi
      .completeStripeSession(stripeSessionId)
      .then((res) => {
        clearCart();
        toast('Payment confirmed', 'success');
        setSearchParams({}, { replace: true });
        navigate(`/order-success/${res.data._id}`, { state: { order: res.data } });
      })
      .catch((err) => {
        setError(err.message);
        toast(err.message, 'error');
        stripeHandledRef.current = null;
      })
      .finally(() => setStripeCompleting(false));
  }, [
    isStripeSuccessReturn,
    stripeSessionId,
    clearCart,
    navigate,
    setSearchParams,
    toast,
  ]);

  const shipping = total >= FREE_SHIPPING_MIN ? 0 : SHIPPING;
  const finalTotal = Math.max(0, total - discount + shipping);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const res = await orderApi.validateCoupon(coupon.trim());
      const pct = res.data.discountPercent || 50;
      setDiscount(Math.round(total * (pct / 100) * 100) / 100);
      setError('');
      toast('Coupon applied', 'success');
    } catch (err) {
      setDiscount(0);
      setError(err.message);
    }
  };

  const placeOrder = async () => {
    const idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `order-${Date.now()}`;

    const res = await orderApi.place(
      {
        ...form,
        items,
        totalAmount: finalTotal,
        shippingFee: shipping,
        couponCode: discount > 0 ? coupon.trim().toUpperCase() : undefined,
        paymentMethod,
      },
      idempotencyKey
    );
    clearCart();
    toast('Order placed successfully', 'success');
    navigate(`/order-success/${res.data._id}`, { state: { order: res.data } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError('');

    try {
      if (paymentMethod === 'card') {
        const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        if (stripeKey) {
          setProcessingPayment(true);
          const stripe = await stripePromise;
          const session = await orderApi.createCheckoutSession({
            ...form,
            items,
            shippingFee: shipping,
            totalAmount: finalTotal,
            couponCode: discount > 0 ? coupon.trim().toUpperCase() : undefined,
          });

          if (stripe && session.data?.id) {
            const { error: stripeError } = await stripe.redirectToCheckout({
              sessionId: session.data.id,
            });
            if (stripeError) throw stripeError;
            return;
          }
          throw new Error('Stripe checkout is unavailable right now.');
        }

        setProcessingPayment(true);
        await new Promise((r) => setTimeout(r, 1800));
        setProcessingPayment(false);
      }

      await placeOrder();
    } catch (err) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  if (stripeCompleting || isStripeSuccessReturn) {
    return (
      <Layout>
        <div className="container section narrow empty-state">
          <div className="spinner" />
          <p>Confirming your payment…</p>
        </div>
      </Layout>
    );
  }

  if (searchParams.get('stripe') === 'cancelled') {
    return (
      <Layout>
        <div className="container section narrow empty-state">
          <h1>Payment cancelled</h1>
          <p className="muted">Your cart is still saved. You can try again when ready.</p>
          <Link to="/checkout" className="btn btn-primary" onClick={() => setSearchParams({})}>
            Return to checkout
          </Link>
        </div>
      </Layout>
    );
  }

  if (!items.length && !isStripeSuccessReturn) {
    return (
      <Layout>
        <div className="container section narrow empty-state">
          <p>Your cart is empty.</p>
          <Link to="/shop" className="btn btn-primary">Go to shop</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container section checkout-layout">
        <div className="checkout-main">
          <h1>Checkout</h1>
          <form className="form-card" onSubmit={handleSubmit}>
            <fieldset className="checkout-fieldset">
              <legend>Contact & delivery</legend>
              <label>
                Full name
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>
                Email
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label>
                Phone
                <input type="tel" required pattern="[0-9+\s-]{10,}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </label>
              <label>
                Shipping address
                <textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </label>
            </fieldset>

            <fieldset className="checkout-fieldset">
              <legend>Payment method</legend>
              <div className="payment-options">
                {[
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                  { id: 'card', label: 'Credit / Debit Card', desc: 'Secure Stripe checkout' },
                  { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
                ].map((opt) => (
                  <label key={opt.id} className={`payment-option ${paymentMethod === opt.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                    />
                    <div>
                      <strong>{opt.label}</strong>
                      <span className="muted">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="coupon-row">
              <input placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              <button type="button" className="btn btn-outline" onClick={applyCoupon}>Apply</button>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || processingPayment}>
              {processingPayment ? 'Redirecting to payment…' : loading ? 'Placing order…' : `Pay ₹${finalTotal.toLocaleString('en-IN')}`}
            </button>
          </form>
        </div>

        <aside className="checkout-sidebar">
          <h2>Order summary</h2>
          <ul className="checkout-items">
            {items.map((item, i) => (
              <li key={`${item._id}-${i}`}>
                <img src={item.imageUrl} alt="" onError={(e) => { e.target.src = '/images/black.png'; }} />
                <div>
                  <strong>{item.name}</strong>
                  <span className="muted">Qty {item.quantity || 1}</span>
                </div>
                <span>₹{(Number(item.price) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
          <div className="checkout-summary">
            <p>Subtotal <span>₹{total.toLocaleString('en-IN')}</span></p>
            <p>Shipping <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></p>
            {discount > 0 && <p className="success-text">Discount <span>−₹{discount.toLocaleString('en-IN')}</span></p>}
            <p className="checkout-total"><strong>Total</strong> <strong>₹{finalTotal.toLocaleString('en-IN')}</strong></p>
          </div>
          <div className="checkout-trust">
            <p>🔒 SSL secured checkout</p>
            <p>📦 Estimated delivery: 3–5 business days</p>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
