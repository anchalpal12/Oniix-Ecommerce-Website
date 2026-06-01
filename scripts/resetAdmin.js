require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@onix.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'Admin';

async function resetAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Onix';
  await mongoose.connect(uri);

  // Remove any account with this email (user or admin) and recreate cleanly
  await User.deleteMany({ email: ADMIN_EMAIL.toLowerCase() });
  await User.deleteMany({ email: { $ne: ADMIN_EMAIL.toLowerCase() }, role: 'admin' });

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL.toLowerCase(),
    password: ADMIN_PASSWORD,
    role: 'admin',
  });

  console.log('✅ Admin account ready at', ADMIN_EMAIL);

  console.log('\n--- Admin login ---');
  console.log('Email:   ', ADMIN_EMAIL);
  console.log('Password:', ADMIN_PASSWORD);
  console.log('URL:      http://localhost:5173/login  (dev) or http://localhost:5000/login');
  console.log('Admin:    http://localhost:5173/admin\n');

  await mongoose.disconnect();
}

resetAdmin().catch((err) => {
  console.error('❌ Failed to reset admin:', err.message);
  process.exit(1);
});
