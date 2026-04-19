import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally — only redirect on 401 for non-auth routes
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      // Only force logout if NOT hitting auth endpoints (avoid redirect loops)
      if (!url.includes('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Soft redirect — don't break the app on public pages
        if (window.location.pathname.startsWith('/admin') ||
            window.location.pathname.startsWith('/business')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;

/* ─── Typed service helpers ──────────────────────────────── */

export const authService = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe:    ()     => api.get('/auth/me'),
};

export const listingService = {
  getAll:       (params)     => api.get('/listings', { params }),
  getBySlug:    (slug)       => api.get(`/listings/${slug}`),
  autocomplete: (q)          => api.get('/listings/search/autocomplete', { params: { q } }),
  create:       (data)       => api.post('/listings', data),
  update:       (id, data)   => api.put(`/listings/${id}`, data),
  delete:       (id)         => api.delete(`/listings/${id}`),
  trackClick:   (id, button_type) => api.post(`/listings/${id}/click`, { button_type }).catch(() => {}),
};

export const reviewService = {
  getAll:  (listingId)       => api.get(`/listings/${listingId}/reviews`),
  create:  (listingId, data) => api.post(`/listings/${listingId}/reviews`, data),
  remove:  (id)              => api.delete(`/reviews/${id}`),
};

export const offerService = {
  getAll:  ()        => api.get('/offers'),
  create:  (data)    => api.post('/offers', data),
  update:  (id, d)   => api.put(`/offers/${id}`, d),
  delete:  (id)      => api.delete(`/offers/${id}`),
};

export const analyticsService = {
  overview:    ()           => api.get('/analytics/overview'),
  getListing:  (id, period) => api.get(`/analytics/listing/${id}`, { params: { period } }),
};

export const adminService = {
  getUsers:    (params) => api.get('/admin/users', { params }),
  createUser:  (data)   => api.post('/admin/users', data),
  updateUser:  (id, d)  => api.patch(`/admin/users/${id}`, d),
  getContacts: ()       => api.get('/admin/contacts'),
  markRead:    (id)     => api.patch(`/admin/contacts/${id}/read`),
};

export const contactService = {
  submit: (data) => api.post('/contacts', data),
};
