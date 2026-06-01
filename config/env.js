require('dotenv').config();

const REQUIRED_IN_PRODUCTION = ['JWT_SECRET', 'MONGODB_URI'];

function parsePort(value, fallback) {
  const port = Number(value ?? fallback);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${value}`);
  }
  return port;
}

function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]?.trim());

  if (isProduction && missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (isProduction && process.env.JWT_SECRET?.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }

  const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  if (isProduction && stripeEnabled && !process.env.STRIPE_WEBHOOK_SECRET?.trim()) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required when STRIPE_SECRET_KEY is set in production');
  }
}

validateEnv();

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: parsePort(process.env.PORT, 5000),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Onix',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-in-production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  appBaseUrl: process.env.APP_BASE_URL || process.env.CLIENT_URL || 'http://localhost:5173',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  requestTimeoutMs: Math.max(5000, Number(process.env.REQUEST_TIMEOUT_MS) || 30000),
});

module.exports = env;
