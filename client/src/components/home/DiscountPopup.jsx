import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { discountApi } from '../../api/client';

export default function DiscountPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const dismissed = sessionStorage.getItem('onix_popup_dismissed');
    if (dismissed) return undefined;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem('onix_popup_dismissed', '1');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await discountApi.subscribe(email);
      setCoupon(res.couponCode || res.data?.couponCode || 'Applied!');
    } catch (err) {
      if (err.data?.couponCode) {
        setCoupon(err.data.couponCode);
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="popup-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          role="presentation"
        >
          <motion.div
            className="popup-card"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
          >
            <button type="button" className="popup-close" onClick={close} aria-label="Close">×</button>
            <img src="/images/black.png" alt="Onix" className="popup-logo" />
            <h2 id="popup-title">Get 50% off</h2>
            <p>Subscribe for an exclusive welcome coupon on smart mining glasses.</p>
            {!coupon ? (
              <form onSubmit={submit}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-block">Get coupon</button>
                {error && <p className="error-text">{error}</p>}
              </form>
            ) : (
              <p className="coupon-reveal">Your code: <strong>{coupon}</strong></p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
