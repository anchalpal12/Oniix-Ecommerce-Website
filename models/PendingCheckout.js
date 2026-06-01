const mongoose = require('mongoose');

const pendingItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    imageUrl: String,
  },
  { _id: false }
);

const pendingCheckoutSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    items: [pendingItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, trim: true },
    stripeSessionId: { type: String, index: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired'],
      default: 'pending',
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

pendingCheckoutSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

module.exports = mongoose.model('PendingCheckout', pendingCheckoutSchema);
