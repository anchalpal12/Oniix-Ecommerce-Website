const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  imageUrl: String, // 👈 MUST be included
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
