import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// v6: 429 retry + token injection
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};

    if (
      error.response?.status === 401 &&
      !config.url?.includes("/auth/") &&
      localStorage.getItem("token")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") window.location.href = "/login";
    }

    if (error.response?.status === 429 && (config.__retryCount || 0) < 2) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      const waitMs = 400 * Math.pow(2, config.__retryCount);
      await new Promise((r) => setTimeout(r, waitMs));
      return api(config);
    }

    return Promise.reject(error);
  },
);

// ─── Services — keeps ALL original method names, adds v6 aliases ──

export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  me: () => api.get("/auth/me"), // v6 alias
  logout: () => api.post("/auth/logout"),
};

export const listingService = {
  getAll: (params) => api.get("/listings", { params }),
  getBySlug: (slug) => api.get(`/listings/${slug}`),
  autocomplete: (q) =>
    api.get("/listings/search/autocomplete", { params: { q } }),
  create: (data) => api.post("/listings", data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  trackClick: (id, button_type) =>
    api.post(`/listings/${id}/click`, { button_type }).catch(() => {}),
};

export const reviewService = {
  getAll: (listingId) => api.get(`/listings/${listingId}/reviews`),
  getForListing: (listingId) => api.get(`/listings/${listingId}/reviews`), // alias
  create: (listingId, data) => api.post(`/listings/${listingId}/reviews`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
  delete: (id) => api.delete(`/reviews/${id}`), // alias
};

export const offerService = {
  getAll: () => api.get("/offers"),
  create: (data) => api.post("/offers", data),
  update: (id, d) => api.put(`/offers/${id}`, d),
  delete: (id) => api.delete(`/offers/${id}`),
};

export const contactService = {
  submit: (data) => api.post("/contacts", data),
};

// Uses singular /analytics/listing/:id (original route)
export const analyticsService = {
  overview: () => api.get("/analytics/overview"),
  getListing: (id, period) =>
    api.get(`/analytics/listing/${id}`, { params: { period } }),
  listing: (id, period) =>
    api.get(`/analytics/listing/${id}`, { params: { period } }),
  statistics: () => api.get("/analytics/statistics"),
};

export const adminService = {
  getUsers: (params) => api.get("/admin/users", { params }),
  createUser: (data) => api.post("/admin/users", data),
  updateUser: (id, d) => api.patch(`/admin/users/${id}`, d),
  getContacts: () => api.get("/admin/contacts"),
  markRead: (id) => api.patch(`/admin/contacts/${id}/read`),
};

// v6: Menu categories & items
export const menuService = {
  getCategories: (listingId) =>
    api.get(`/menu-categories/listings/${listingId}`),
  createCategory: (listingId, data) =>
    api.post(`/menu-categories/listings/${listingId}`, data),
  updateCategory: (id, data) => api.put(`/menu-categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/menu-categories/${id}`),
  reorderCategories: (listingId, ids) =>
    api.put(`/menu-categories/listings/${listingId}/reorder`, { ids }),

  getItems: (listingId) => api.get(`/listings/${listingId}/menu`),
  createItem: (listingId, d) => api.post(`/listings/${listingId}/menu`, d),
  updateItem: (id, d) => api.put(`/menu/${id}`, d),
  deleteItem: (id) => api.delete(`/menu/${id}`),
};

export const favoritesService = {
  list: () => api.get("/favorites"),
  check: (ids) =>
    api.get("/favorites/check", { params: { ids: ids.join(",") } }),
  toggle: (listingId) => api.post(`/favorites/${listingId}`),
};

export const roomsService = {
  getAll: (listingId) => api.get(`/listings/${listingId}/rooms`),
  create: (listingId, d) => api.post(`/listings/${listingId}/rooms`, d),
  update: (id, d) => api.put(`/rooms/${id}`, d),
  delete: (id) => api.delete(`/rooms/${id}`),
};

export default api;
