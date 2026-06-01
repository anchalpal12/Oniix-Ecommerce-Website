const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true, index: true },
  imageUrl: { type: String, required: true, trim: true },
  stock: { type: Number, default: 100, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  badge: { type: String, trim: true },
  rating: { type: Number, min: 0, max: 5, default: 4.5 },
  reviewCount: { type: Number, min: 0, default: 0 },
}, {
  timestamps: true,
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
