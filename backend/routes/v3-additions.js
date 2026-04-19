// ============================================================
// ADD TO YOUR EXISTING backend/routes/ SETUP
// These are the NEW routes needed for v3
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
menuRouter.get('/listings/:listingId/menu',     menuCtrl.getMenu);

// Admin-only writes
menuRouter.post('/listings/:listingId/menu',    authenticate, authorize('admin'), menuCtrl.createMenuItem);
menuRouter.put('/menu/:id',                     authenticate, authorize('admin'), menuCtrl.updateMenuItem);
menuRouter.delete('/menu/:id',                  authenticate, authorize('admin'), menuCtrl.deleteMenuItem);

module.exports = { uploadRouter, menuRouter };
