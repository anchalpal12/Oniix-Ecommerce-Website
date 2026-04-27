const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // ✅ FIXED: Add model import

const {
  placeOrder,
  getAllOrders,
  getOrdersByEmail,
  deleteOrder,
  filterOrdersByDate,
} = require('../controllers/orderController');

// ✅ Place a new order
router.post('/place-order', placeOrder);

// ✅ Get all orders (Admin only)
router.get('/all', getAllOrders);

// ✅ Get orders by email (User)
router.get('/user', getOrdersByEmail);

// ✅ Delete a specific order by ID
router.delete('/:id', deleteOrder);

// ✅ Filter orders by date range
router.get('/filter', filterOrdersByDate);

// ✅ Get total order count
router.get('/count', async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get order count', error: err });
  }
});

module.exports = router;
