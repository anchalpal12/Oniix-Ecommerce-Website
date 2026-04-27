const mongoose = require('mongoose');

const discountSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,  // prevent duplicate emails
    lowercase: true,
    trim: true
  },
  couponCode: {
    type: String,
    required: true,
    unique: true,  // ensure every coupon code is different
    trim: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DiscountSubscriber', discountSubscriberSchema);
