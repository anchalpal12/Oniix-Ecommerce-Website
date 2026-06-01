const request = require('supertest');
const app = require('../app');

describe('Health endpoints', () => {
  it('GET /api/health/live returns alive', async () => {
    const res = await request(app).get('/api/health/live');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('alive');
  });

  it('GET /api/health returns ok with metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('environment');
  });

  it('GET /api/health/ready returns ready when DB connected', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.db).toBe('connected');
  });

  it('includes X-Request-Id header', async () => {
    const res = await request(app).get('/api/health/live');
    expect(res.headers['x-request-id']).toBeDefined();
  });
});

describe('404 handling', () => {
  it('returns structured 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.requestId).toBeDefined();
  });
});
