import { useState } from 'react';
import { Link } from 'react-router-dom';
import { discountApi } from '../../api/client';
import ScrollReveal from '../ui/ScrollReveal';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      const res = await discountApi.subscribe(email);
      setMsg(`You're in! Your coupon: ${res.couponCode || res.data?.couponCode || 'SAVE50'}`);
      setEmail('');
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-premium">
      <div className="container newsletter-inner">
        <ScrollReveal direction="left">
          <span className="section-eyebrow section-eyebrow--light">Community</span>
          <h2>Get 50% off your first order</h2>
          <p>Join 12,000+ mining professionals. Exclusive drops, safety guides, and welcome rewards.</p>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <form className="newsletter-form-premium" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your work email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email for discount"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending…' : 'Get coupon'}
            </button>
          </form>
          {msg && <p className="success-text">{msg}</p>}
          {err && <p className="error-text">{err}</p>}
          <p className="newsletter-fine">By subscribing you agree to our privacy policy. Unsubscribe anytime.</p>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function CTABanner() {
  return (
    <section className="cta-banner">
      <div className="container cta-inner">
        <ScrollReveal>
          <h2>Ready to equip your crew?</h2>
          <p>Browse the full catalog or talk to our enterprise team for bulk pricing.</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary btn-lg">Shop now</Link>
            <Link to="/contact" className="btn btn-glass btn-lg">Contact sales</Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
