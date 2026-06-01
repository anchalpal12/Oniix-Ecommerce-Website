const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const {
  placeOrder,
  getAllOrders,
  getMyOrders,
  getOrdersByEmail,
  getOrderById,
  deleteOrder,
  filterOrdersByDate,
  updateOrderStatus,
  validateCoupon,
  createStripeCheckoutSession,
  completeStripeCheckout,
} = require('../controllers/orderController');
const { authenticateToken, authorizeAdmin, authorizeAdminOrSelf } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  placeOrderRules,
  checkoutSessionRules,
  stripeCompleteRules,
  couponParamRules,
} = require('../validators/orderValidators');

router.post('/place-order', placeOrderRules, validate, placeOrder);
router.post('/create-checkout-session', checkoutSessionRules, validate, createStripeCheckoutSession);
router.get('/stripe/complete', stripeCompleteRules, validate, completeStripeCheckout);
router.get('/validate-coupon/:code', couponParamRules, validate, validateCoupon);

router.get('/count', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get order count' });
  }
});

router.get('/all', authenticateToken, authorizeAdmin, getAllOrders);
router.get('/mine', authenticateToken, getMyOrders);
router.get('/user', authenticateToken, authorizeAdminOrSelf, getOrdersByEmail);
router.get('/filter', authenticateToken, authorizeAdmin, filterOrdersByDate);
router.get('/:id', authenticateToken, getOrderById);
router.patch('/:id/status', authenticateToken, authorizeAdmin, updateOrderStatus);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteOrder);

module.exports = router;
