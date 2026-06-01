import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Overview', icon: '◫', end: true },
  { to: '/admin/orders', label: 'Orders', icon: '☰' },
  { to: '/admin/products', label: 'Products', icon: '▣' },
  { to: '/admin/users', label: 'Users', icon: '👤' },
];

export default function AdminLayout({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">O</span>
          <div>
            <strong>Onix</strong>
            <span>Admin Console</span>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <span className="admin-nav-icon" aria-hidden>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <NavLink to="/" className="admin-nav-link admin-nav-link--muted">
            ← Back to store
          </NavLink>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">{title}</h1>
            {subtitle && <p className="admin-page-sub">{subtitle}</p>}
          </div>
          <div className="admin-header-actions">
            {actions}
            <div className="admin-user-chip">
              <span className="admin-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
              <div>
                <strong>{user?.name}</strong>
                <span>Administrator</span>
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
