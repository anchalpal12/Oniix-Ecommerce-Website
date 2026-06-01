const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitizeInput = require('./middleware/sanitizeInput');
const mongoose = require('mongoose');
const env = require('./config/env');
const requestId = require('./middleware/requestId');
const requestTimeout = require('./middleware/requestTimeout');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { handleStripeWebhook } = require('./controllers/webhookController');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.set('trust proxy', 1);
app.use(requestId);
app.use(requestTimeout(env.requestTimeoutMs));

app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

app.use(cors({ origin: [env.clientUrl, 'http://localhost:5000'], credentials: true }));
app.use(
  morgan(env.isProduction ? 'combined' : 'dev', {
    skip: () => env.isTest,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(sanitizeInput);
app.use(
  helmet({
    contentSecurityPolicy: env.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            connectSrc: ["'self'", 'https://api.stripe.com'],
            frameSrc: ['https://js.stripe.com', 'https://hooks.stripe.com'],
          },
        }
      : false,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many signup attempts, please try again later' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Rate limit exceeded' },
});

app.use('/api/users/login', authLimiter);
app.use('/api/users/signup', signupLimiter);
app.use('/api', apiLimiter);

app.get('/api/health/live', (req, res) => {
  res.json({ success: true, status: 'alive', timestamp: new Date().toISOString() });
});

app.get('/api/health/ready', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (!dbReady) {
    return res.status(503).json({
      success: false,
      status: 'not_ready',
      db: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
  res.json({
    success: true,
    status: 'ready',
    db: 'connected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.env.npm_package_version || '1.0.0',
    environment: env.nodeEnv,
  });
});

const openApiPath = path.join(__dirname, 'docs', 'openapi.json');
app.get('/api/openapi.json', (req, res) => {
  if (fs.existsSync(openApiPath)) {
    return res.sendFile(openApiPath);
  }
  res.status(404).json({ success: false, message: 'OpenAPI spec not found' });
});

app.use('/api/users', userRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/newsletter-subscribers', require('./routes/newsletterRoutes'));
app.use('/api/discount-subscribers', require('./routes/discountRoutes'));
app.use('/api/products', productRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/uploads', express.static('uploads'));
app.use('/api/orders', orderRoutes);

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));

app.get(['/login.html', '/signup.html'], (req, res) => {
  const indexFile = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res.redirect('/login');
});

app.get(/^(?!\/api).*/, (req, res, next) => {
  if (req.method !== 'GET') return next();
  const indexFile = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
