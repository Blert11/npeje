// ============================================================
// ADD these to your existing frontend/src/services/api.js
// (before the `export default api;` line)
// ============================================================

export const favoritesService = {
  list:   ()           => api.get('/favorites'),
  check:  (ids)        => api.get('/favorites/check', { params: { ids: ids.join(',') } }),
  toggle: (listingId)  => api.post(`/favorites/${listingId}`),
};

export const roomsService = {
  getAll:  (listingId)     => api.get(`/listings/${listingId}/rooms`),
  create:  (listingId, d)  => api.post(`/listings/${listingId}/rooms`, d),
  update:  (id, d)         => api.put(`/rooms/${id}`, d),
  delete:  (id)            => api.delete(`/rooms/${id}`),
};
