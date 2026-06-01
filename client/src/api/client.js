const API_BASE = import.meta.env.VITE_API_URL || '/api';

function toQueryString(params = {}) {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );
  if (!entries.length) return '';
  return new URLSearchParams(entries).toString();
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body, options = {}) =>
    request(path, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export const authApi = {
  login: (email, password) => api.post('/users/login', { email, password }),
  signup: (name, email, password) => api.post('/users/signup', { name, email, password }),
  me: () => api.get('/users/me'),
};

export const productApi = {
  list: (params = {}) => {
    const q = toQueryString(params);
    return api.get(`/products${q ? `?${q}` : ''}`);
  },
  get: (id) => api.get(`/products/${id}`),
  count: () => api.get('/products/count'),
  create: (body) => api.post('/products', body),
  update: (id, body) => api.put(`/products/${id}`, body),
  remove: (id) => api.delete(`/products/${id}`),
};

export const reviewApi = {
  forProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (body) => api.post('/reviews', body),
  categories: () => api.get('/reviews/categories'),
};

export const orderApi = {
  place: (body, idempotencyKey) =>
    api.post('/orders/place-order', body, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    }),
  createCheckoutSession: (body) => api.post('/orders/create-checkout-session', body),
  completeStripeSession: (sessionId) =>
    api.get(`/orders/stripe/complete?session_id=${encodeURIComponent(sessionId)}`),
  get: (id) => api.get(`/orders/${id}`),
  mine: () => api.get('/orders/mine'),
  validateCoupon: (code) => api.get(`/orders/validate-coupon/${encodeURIComponent(code)}`),
  all: (params = {}) => {
    const q = toQueryString(params);
    return api.get(`/orders/all${q ? `?${q}` : ''}`);
  },
  count: () => api.get('/orders/count'),
  remove: (id) => api.delete(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const userApi = {
  list: () => api.get('/users'),
  count: () => api.get('/users/count'),
  update: (id, body) => api.put(`/users/${id}`, body),
  remove: (id) => api.delete(`/users/${id}`),
};

export const newsletterApi = {
  subscribe: (email) => api.post('/newsletter-subscribers', { email }),
};

export const discountApi = {
  subscribe: (email) => api.post('/discount-subscribers', { email }),
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
};
