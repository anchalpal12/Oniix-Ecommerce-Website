require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { PRODUCT_CATALOG } = require('./productCatalog');

async function seedProducts() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Onix';
  await mongoose.connect(uri);

  const count = await Product.countDocuments();
  if (count > 0 && !process.argv.includes('--force')) {
    console.log(`ℹ️  Database already has ${count} product(s). Skipping seed (use --force to replace).`);
    await mongoose.disconnect();
    return;
  }

  if (count > 0) {
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products (--force).');
  }

  await Product.insertMany(PRODUCT_CATALOG);
  console.log(`✅ Seeded ${PRODUCT_CATALOG.length} products across ${new Set(PRODUCT_CATALOG.map((p) => p.category)).size} categories.`);

  await mongoose.disconnect();
}

seedProducts().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
