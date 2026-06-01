import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    return () => document.body.classList.remove('nav-open');
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/images/black.png" alt="Onix" className="brand-logo" />
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/shop" onClick={() => setOpen(false)}>Shop</NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
          <NavLink to="/cart" className="cart-link" onClick={() => setOpen(false)}>
            Cart {count > 0 && <span className="badge">{count}</span>}
          </NavLink>
          <NavLink to="/wishlist" onClick={() => setOpen(false)}>
            Wishlist {wishCount > 0 && <span className="badge">{wishCount}</span>}
          </NavLink>
          {!user ? (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
              <NavLink to="/signup" className="btn btn-sm btn-primary" onClick={() => setOpen(false)}>Sign up</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/account" onClick={() => setOpen(false)}>Account</NavLink>
              <span className="nav-user">Hi, {user.name}</span>
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink>
              )}
              <button type="button" className="btn btn-sm btn-outline" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
