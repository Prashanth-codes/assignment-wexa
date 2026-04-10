const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustStock,
  deleteProduct,
  getDashboard,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboard);
router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);
router.patch('/:id/adjust-stock', adjustStock);

module.exports = router;