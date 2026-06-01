const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

async function createProduct(overrides = {}) {
  return Product.create({
    name: 'Test Glass',
    description: 'Test',
    price: 1000,
    category: 'Mining',
    imageUrl: '/images/test.jpg',
    stock: 10,
    ...overrides,
  });
}

function authHeader(user) {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '1h' }
  );
  return { Authorization: `Bearer ${token}` };
}

describe('Orders API', () => {
  let product;

  beforeEach(async () => {
    product = await createProduct();
  });

  const orderBody = (overrides = {}) => ({
    name: 'Test User',
    email: 'buyer@example.com',
    phone: '9876543210',
    address: '123 Test St',
    items: [
      {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
      },
    ],
    totalAmount: 1099,
    shippingFee: 99,
    paymentMethod: 'cod',
    ...overrides,
  });

  it('places a COD order and decrements stock', async () => {
    const res = await request(app).post('/api/orders/place-order').send(orderBody());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('buyer@example.com');

    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(9);
  });

  it('rejects order when total mismatches', async () => {
    const res = await request(app)
      .post('/api/orders/place-order')
      .send(orderBody({ totalAmount: 1 }));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects order when stock is insufficient', async () => {
    await Product.findByIdAndUpdate(product._id, { stock: 0 });

    const res = await request(app).post('/api/orders/place-order').send(orderBody());

    expect(res.status).toBe(400);
  });

  it('returns same order for duplicate Idempotency-Key', async () => {
    const key = 'test-idempotency-key-1';
    const first = await request(app)
      .post('/api/orders/place-order')
      .set('Idempotency-Key', key)
      .send(orderBody());

    const second = await request(app)
      .post('/api/orders/place-order')
      .set('Idempotency-Key', key)
      .send(orderBody({ totalAmount: 1099 }));

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.data._id).toBe(first.body.data._id);

    const count = await Order.countDocuments();
    expect(count).toBe(1);
  });

  it('paginates admin order list', async () => {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin-orders@test.com',
      password: 'AdminPass1',
      role: 'admin',
    });

    await Order.create({
      name: 'A',
      email: 'a@test.com',
      address: 'Addr',
      items: [{ name: 'X', price: 10, quantity: 1 }],
      totalAmount: 10,
    });

    const res = await request(app)
      .get('/api/orders/all?page=1&limit=10')
      .set(authHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body.data.orders).toBeDefined();
    expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it('registers filter route before :id', async () => {
    const admin = await User.create({
      name: 'Admin2',
      email: 'admin-filter@test.com',
      password: 'AdminPass1',
      role: 'admin',
    });

    const res = await request(app)
      .get('/api/orders/filter?start=2020-01-01&end=2030-01-01')
      .set(authHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
