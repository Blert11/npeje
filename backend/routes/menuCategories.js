const router = require('express').Router();
const ctrl = require('../controllers/menuCategoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/listings/:listingId', ctrl.getCategories);

router.post('/listings/:listingId',        authenticate, authorize('admin','business'), ctrl.createCategory);
router.put('/listings/:listingId/reorder', authenticate, authorize('admin','business'), ctrl.reorderCategories);
router.put('/:id',                         authenticate, authorize('admin','business'), ctrl.updateCategory);
router.delete('/:id',                      authenticate, authorize('admin','business'), ctrl.deleteCategory);

module.exports = router;
