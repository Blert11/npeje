// offers.js
const offerRouter = require('express').Router();
const offerCtrl   = require('../controllers/offerController');
const { authenticate, authorize } = require('../middleware/auth');

offerRouter.get('/', offerCtrl.getOffers);
offerRouter.post('/', authenticate, authorize('admin'), offerCtrl.createOffer);
offerRouter.put('/:id', authenticate, authorize('admin'), offerCtrl.updateOffer);
offerRouter.delete('/:id', authenticate, authorize('admin'), offerCtrl.deleteOffer);

// analytics.js
const analyticsRouter = require('express').Router();
const analyticsCtrl   = require('../controllers/analyticsController');

analyticsRouter.get('/overview', authenticate, authorize('admin'), analyticsCtrl.getOverview);
analyticsRouter.get('/listing/:id', authenticate, authorize('admin', 'business'), analyticsCtrl.getListingAnalytics);

// admin.js
const adminRouter = require('express').Router();
const adminCtrl   = require('../controllers/adminController');
const { body } = require('express-validator');

adminRouter.get('/users',  authenticate, authorize('admin'), adminCtrl.getUsers);
adminRouter.post('/users', authenticate, authorize('admin'),
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('role').isIn(['user','admin','business']),
  ],
  adminCtrl.createUser
);
adminRouter.patch('/users/:id', authenticate, authorize('admin'), adminCtrl.updateUser);
adminRouter.get('/contacts', authenticate, authorize('admin'), adminCtrl.getContacts);
adminRouter.patch('/contacts/:id/read', authenticate, authorize('admin'), adminCtrl.markContactRead);

// contacts.js
const contactRouter = require('express').Router();
const contactCtrl   = require('../controllers/contactController');
const { optionalAuth } = require('../middleware/auth');

contactRouter.post('/', optionalAuth,
  [
    require('express-validator').body('name').notEmpty(),
    require('express-validator').body('email').isEmail(),
    require('express-validator').body('message').notEmpty().isLength({ min: 10 }),
  ],
  contactCtrl.submitContact
);

// reviews delete
const reviewRouter = require('express').Router();
const reviewCtrl   = require('../controllers/reviewController');
reviewRouter.delete('/:id', authenticate, reviewCtrl.deleteReview);

module.exports = { offerRouter, analyticsRouter, adminRouter, contactRouter, reviewRouter };
