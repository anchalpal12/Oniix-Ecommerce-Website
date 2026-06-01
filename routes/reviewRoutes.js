const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, getCategories } = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/product/:productId', getProductReviews);
router.post('/', authenticateToken, createReview);

module.exports = router;
