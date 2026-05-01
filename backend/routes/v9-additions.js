// ============================================================
// backend/routes/v9-additions.js
// Wire these into server.js:
//   const { favoritesRouter, roomsRouter } = require('./routes/v9-additions');
//   app.use('/api/favorites', favoritesRouter);
//   app.use('/api', roomsRouter);
// ============================================================

const { authenticate, authorize } = require('../middleware/auth');

// ─── Favorites ──────────────────────────────────────────────
const favoritesRouter = require('express').Router();
const favCtrl = require('../controllers/favoritesController');

favoritesRouter.get('/',          authenticate, favCtrl.list);
favoritesRouter.get('/check',     authenticate, favCtrl.check);
favoritesRouter.post('/:listingId', authenticate, favCtrl.toggle);

// ─── Rooms ──────────────────────────────────────────────────
const roomsRouter = require('express').Router();
const roomCtrl = require('../controllers/roomsController');

roomsRouter.get('/listings/:listingId/rooms', roomCtrl.getRooms);
roomsRouter.post('/listings/:listingId/rooms', authenticate, authorize('admin','business'), roomCtrl.createRoom);
roomsRouter.put('/rooms/:id',    authenticate, authorize('admin','business'), roomCtrl.updateRoom);
roomsRouter.delete('/rooms/:id', authenticate, authorize('admin','business'), roomCtrl.deleteRoom);

module.exports = { favoritesRouter, roomsRouter };
