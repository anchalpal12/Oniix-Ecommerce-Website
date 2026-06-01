import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('UI error:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container section narrow empty-state">
          <h1>Something went wrong</h1>
          <p className="muted">We hit an unexpected error. Try refreshing or return home.</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Refresh
            </button>
            <Link to="/" className="btn btn-outline">Go home</Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
