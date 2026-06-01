const Stripe = require('stripe');
const env = require('../config/env');
const logger = require('../utils/logger');
const { fulfillStripeSession } = require('../services/orderService');

let stripeClient = null;

function getStripe() {
  if (!env.stripeSecretKey) return null;
  if (!stripeClient) stripeClient = new Stripe(env.stripeSecretKey);
  return stripeClient;
}

exports.handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    return res.status(503).send('Stripe webhooks not configured');
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (err) {
    logger.warn({ err: err.message }, 'Stripe webhook signature verification failed');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.id) {
        await fulfillStripeSession(session.id);
      }
    }
  } catch (err) {
    logger.error({ err, eventType: event.type }, 'Stripe webhook handler failed');
    return res.status(500).send('Webhook handler failed');
  }

  res.json({ received: true });
};
