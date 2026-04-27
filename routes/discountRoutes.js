const express = require('express');
const router = express.Router();
const DiscountSubscriber = require('../models/DiscountSubscriber');

// Utility function to generate unique coupon codes
function generateCouponCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SAVE50-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST: Add a new discount subscriber with unique coupon
router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  try {
    // Check if email already subscribed
    const existing = await DiscountSubscriber.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already subscribed',
        couponCode: existing.couponCode
      });
    }

    // Generate unique coupon code
    let couponCode;
    let isUnique = false;
    while (!isUnique) {
      couponCode = generateCouponCode();
      const existingCode = await DiscountSubscriber.findOne({ couponCode });
      if (!existingCode) isUnique = true;
    }

    // Save to database
    const subscriber = new DiscountSubscriber({ email, couponCode });
    await subscriber.save();

    res.status(201).json({
      success: true,
      message: 'Subscription successful',
      couponCode
    });
  } catch (err) {
    console.error('Error in discount subscription:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET: Get all discount subscribers (for admin dashboard)
router.get('/', async (req, res) => {
  try {
    const subscribers = await DiscountSubscriber.find().sort({ subscribedAt: -1 });
    res.json({ success: true, subscribers });
  } catch (err) {
    console.error('Error fetching discount subscribers:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
