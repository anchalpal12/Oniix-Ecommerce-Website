import { Link } from 'react-router-dom';

const TRUST = ['ISO Certified', 'Secure Checkout', '2-Year Warranty', '48h Dispatch'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-trust">
        {TRUST.map((t) => (
          <span key={t} className="trust-badge">{t}</span>
        ))}
      </div>
      <div className="container footer-grid">
        <div>
          <img src="/images/black.png" alt="Onix" className="footer-logo" />
          <p className="muted">Smart mining glasses for safety and performance underground.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop">All Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/checkout">Checkout</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p className="muted">info@onix.com</p>
          <p className="muted">+91 98765 43210</p>
          <p className="muted">Pune, Maharashtra, India</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Onix. All rights reserved.</p>
      </div>
    </footer>
  );
}
