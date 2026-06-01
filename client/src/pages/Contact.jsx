import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { newsletterApi } from '../api/client';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleContact = (e) => {
    e.preventDefault();
    setMsg('Thanks! We received your message and will respond within 24 hours.');
    setForm({ name: '', email: '', message: '' });
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await newsletterApi.subscribe(newsletterEmail);
      setMsg('Subscribed to newsletter successfully!');
      setNewsletterEmail('');
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <Layout>
      <div className="container section">
        <div className="split contact-split">
          <div>
            <h1>Contact Us</h1>
            <p className="muted">Questions about products, bulk orders, or partnerships? Reach out.</p>
            <ul className="contact-list">
              <li><strong>Phone:</strong> +91 98765 43210</li>
              <li><strong>Email:</strong> info@onix.com</li>
              <li><strong>Address:</strong> Tech Industrial Zone, Pune, Maharashtra</li>
            </ul>
          </div>

          <form className="form-card" onSubmit={handleContact}>
            <h2>Send a message</h2>
            <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Message<textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
            <button type="submit" className="btn btn-primary btn-block">Send</button>
          </form>
        </div>

        <form className="form-card newsletter-card" onSubmit={handleNewsletter}>
          <h2>Stay connected</h2>
          <div className="coupon-row">
            <input type="email" placeholder="Your email" required value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </div>
          {msg && <p className="success-text">{msg}</p>}
          {err && <p className="error-text">{err}</p>}
        </form>
      </div>
    </Layout>
  );
}
