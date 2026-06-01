import { Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h1>Access denied</h1>
        <p>You need an administrator account to open the admin console.</p>
        <div className="admin-access-actions">
          <Link to="/" className="btn btn-primary">Back to store</Link>
          <Link to="/account" className="btn btn-ghost">My account</Link>
        </div>
      </div>
    );
  }

  return children;
}
