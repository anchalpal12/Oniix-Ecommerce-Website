const { body, param, query } = require('express-validator');

const orderItemRules = body('items')
  .isArray({ min: 1 })
  .withMessage('At least one item is required');

const placeOrderRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('address').trim().notEmpty().withMessage('Address is required').isLength({ max: 500 }),
  body('phone').optional().trim().isLength({ max: 20 }),
  orderItemRules,
  body('items.*.name').trim().notEmpty(),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Invalid item price'),
  body('items.*.quantity').optional().isInt({ min: 1 }),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount is required'),
  body('shippingFee').optional().isFloat({ min: 0 }),
  body('paymentMethod').optional().isIn(['cod', 'card', 'upi']),
  body('couponCode').optional().trim().isLength({ max: 50 }),
];

const checkoutSessionRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phone').optional().trim().isLength({ max: 20 }),
  orderItemRules,
  body('items.*.name').trim().notEmpty(),
  body('items.*.price').isFloat({ min: 0 }),
  body('items.*.quantity').optional().isInt({ min: 1 }),
  body('totalAmount').isFloat({ min: 0 }),
  body('shippingFee').optional().isFloat({ min: 0 }),
  body('couponCode').optional().trim().isLength({ max: 50 }),
];

const stripeCompleteRules = [
  query('session_id').trim().notEmpty().withMessage('session_id is required'),
];

const couponParamRules = [
  param('code').trim().notEmpty().withMessage('Coupon code is required'),
];

module.exports = {
  placeOrderRules,
  checkoutSessionRules,
  stripeCompleteRules,
  couponParamRules,
};
