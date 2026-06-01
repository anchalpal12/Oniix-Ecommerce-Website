const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

router.get('/count', productController.getProductCount);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post('/', authenticateToken, authorizeAdmin, productController.createProduct);
router.put('/:id', authenticateToken, authorizeAdmin, productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeAdmin, productController.deleteProduct);

module.exports = router;
