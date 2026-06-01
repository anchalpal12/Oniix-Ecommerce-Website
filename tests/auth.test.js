const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  const user = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'SecurePass1',
  };

  it('rejects signup with weak password', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ ...user, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('rejects signup with invalid email', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ ...user, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('signs up, logs in, and fetches /me', async () => {
    const signup = await request(app).post('/api/users/signup').send(user);
    expect(signup.status).toBe(201);
    expect(signup.body.success).toBe(true);

    const login = await request(app)
      .post('/api/users/login')
      .send({ email: user.email, password: user.password });

    expect(login.status).toBe(200);
    expect(login.body.data.token).toBeDefined();

    const me = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(user.email);
    expect(me.body.data.password).toBeUndefined();
  });

  it('rejects duplicate signup', async () => {
    await request(app).post('/api/users/signup').send(user);

    const res = await request(app).post('/api/users/signup').send(user);
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/exists/i);
  });

  it('rejects login with wrong password', async () => {
    await request(app).post('/api/users/signup').send(user);

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: user.email, password: 'WrongPass1' });

    expect(res.status).toBe(401);
  });

  it('rejects /me without token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});
