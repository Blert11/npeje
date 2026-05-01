// ============================================================
// backend/routes/v3-additions.js — v6 FIXED
// ============================================================

// ─── upload.js ──────────────────────────────────────────────
const uploadRouter   = require('express').Router();
const uploadCtrl     = require('../controllers/uploadController');
const { upload }     = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');

uploadRouter.post('/',         authenticate, upload.single('file'),      uploadCtrl.uploadSingle);
uploadRouter.post('/multiple', authenticate, upload.array('files', 10), uploadCtrl.uploadMultiple);

// ─── menu.js ────────────────────────────────────────────────
const menuRouter = require('express').Router();
const menuCtrl   = require('../controllers/menuController');

// Public read
menuRouter.get('/listings/:listingId/menu', menuCtrl.getMenu);

// Admin-only writes — FIXED: use v6 function names (createItem, updateItem, deleteItem)
menuRouter.post('/listings/:listingId/menu', authenticate, authorize('admin','business'), menuCtrl.createItem);
menuRouter.put('/menu/:id',                  authenticate, authorize('admin','business'), menuCtrl.updateItem);
menuRouter.delete('/menu/:id',               authenticate, authorize('admin','business'), menuCtrl.deleteItem);

module.exports = { uploadRouter, menuRouter };
