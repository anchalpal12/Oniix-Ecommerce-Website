const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, default: 1, min: 1 },
  imageUrl: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: { type: String, required: true, trim: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, default: 0, min: 0 },
  paymentMethod: { type: String, enum: ['cod', 'card', 'upi'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  couponCode: { type: String, trim: true },
  stripeSessionId: { type: String, unique: true, sparse: true },
}, {
  timestamps: true,
});

orderSchema.index({ email: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
