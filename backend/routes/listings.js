const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/listingController');
const rCtrl  = require('../controllers/reviewController');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');

// Public
router.get('/search/autocomplete', ctrl.autocomplete);
router.get('/', ctrl.getListings);
router.get('/:slug', optionalAuth, ctrl.getListing);
router.post('/:id/click', optionalAuth, ctrl.trackClick);

// Reviews on a listing
router.get('/:listingId/reviews', rCtrl.getReviews);
router.post('/:listingId/reviews', authenticate,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isLength({ max: 1000 }),
  ],
  rCtrl.createReview
);

// Admin-only — controller handles validation now
router.post('/',      authenticate, authorize('admin'), ctrl.createListing);
router.put('/:id',    authenticate, authorize('admin'), ctrl.updateListing);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteListing);

module.exports = router;
