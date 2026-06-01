const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function adminToken(userId) {
  return jwt.sign(
    { id: userId, role: 'admin', name: 'Admin', email: 'admin@test.com' },
    env.jwtSecret,
    { expiresIn: '1h' }
  );
}

describe('Admin dashboard API', () => {
  let token;

  beforeAll(async () => {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin-dashboard@test.com',
      password: 'AdminPass1',
      role: 'admin',
    });
    token = adminToken(admin._id);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });

  it('returns dashboard stats for admin', async () => {
    await Order.create({
      name: 'Buyer',
      email: 'buyer@test.com',
      address: '123 Test St',
      items: [{ name: 'Goggles', price: 1000, quantity: 1 }],
      totalAmount: 1000,
      status: 'pending',
    });

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kpis).toBeDefined();
    expect(res.body.data.kpis.revenue).toHaveProperty('total');
    expect(res.body.data.revenueChart).toHaveLength(7);
    expect(res.body.data.recentOrders.length).toBeGreaterThan(0);
  });
});
