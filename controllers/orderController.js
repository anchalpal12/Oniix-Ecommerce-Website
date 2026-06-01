const Stripe = require('stripe');
const Order = require('../models/Order');
const PendingCheckout = require('../models/PendingCheckout');
const IdempotencyKey = require('../models/IdempotencyKey');
const DiscountSubscriber = require('../models/DiscountSubscriber');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const escapeRegex = require('../utils/escapeRegex');
const { success, error } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { writeAudit } = require('../utils/audit');
const {
  buildOrderPayload,
  createOrderWithStock,
  fulfillStripeSession,
  normalizeItems,
  computeOrderTotals,
  validateStock,
} = require('../services/orderService');

let stripeClient = null;

function getStripeClient() {
  if (!env.stripeSecretKey) return null;
  if (!stripeClient) stripeClient = new Stripe(env.stripeSecretKey);
  return stripeClient;
}

function handleError(res, err) {
  if (err instanceof AppError) {
    return error(res, err.message, err.statusCode, err.errors || undefined);
  }
  logger.error({ err }, 'Order controller error');
  return error(res, 'Request failed.', 500);
}

exports.placeOrder = async (req, res) => {
  try {
    const idempotencyKey = req.get('Idempotency-Key')?.trim();
    if (idempotencyKey) {
      const existing = await IdempotencyKey.findOne({ key: idempotencyKey }).lean();
      if (existing?.orderId) {
        const order = await Order.findById(existing.orderId);
        if (order) {
          return success(res, order, 'Order already placed.');
        }
      }
    }

    const orderPayload = await buildOrderPayload(req.body);
    const order = await createOrderWithStock(orderPayload);

    if (idempotencyKey) {
      await IdempotencyKey.create({ key: idempotencyKey, orderId: order._id }).catch(() => {});
    }

    return success(res, order, 'Order placed successfully.', 201);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.createStripeCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return error(res, 'Stripe is not configured on server.', 503);
    }

    const { name, email, address, phone, items, couponCode, shippingFee, totalAmount } = req.body;
    const normalizedItems = normalizeItems(items);
    await validateStock(normalizedItems);

    const { expectedTotal, shipping, appliedCoupon } = await computeOrderTotals(
      normalizedItems,
      couponCode,
      shippingFee
    );

    if (Math.abs(expectedTotal - parseFloat(totalAmount)) > 1) {
      return error(res, 'Order total mismatch. Please refresh and try again.', 400);
    }

    const pending = await PendingCheckout.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      address: address.trim(),
      items: normalizedItems,
      totalAmount: expectedTotal,
      shippingFee: shipping,
      couponCode: appliedCoupon,
    });

    const lineItems = normalizedItems.map((item) => ({
      quantity: item.quantity || 1,
      price_data: {
        currency: 'inr',
        unit_amount: Math.round((item.price || 0) * 100),
        product_data: {
          name: item.name || 'Onix product',
          images: item.imageUrl?.startsWith('http') ? [item.imageUrl] : [],
        },
      },
    }));

    if (shipping > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'inr',
          unit_amount: Math.round(shipping * 100),
          product_data: { name: 'Shipping fee' },
        },
      });
    }

    const appBase = env.appBaseUrl || env.clientUrl;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: email,
      metadata: {
        source: 'onix-checkout',
        pendingCheckoutId: String(pending._id),
      },
      success_url: `${appBase}/checkout?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBase}/checkout?stripe=cancelled`,
    });

    pending.stripeSessionId = session.id;
    await pending.save();

    return success(res, { id: session.id, url: session.url }, 'Stripe session created');
  } catch (err) {
    return handleError(res, err);
  }
};

exports.completeStripeCheckout = async (req, res) => {
  try {
    const stripe = getStripeClient();
    const sessionId = req.query.session_id;
    if (!stripe) {
      return error(res, 'Stripe is not configured.', 503);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return error(res, 'Payment not completed.', 402);
    }

    const order = await fulfillStripeSession(sessionId);
    return success(res, order, 'Payment confirmed.');
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(),
    ]);

    return success(res, {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return error(res, 'Failed to fetch orders.', 500);
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    if (!req.user?.email) return error(res, 'Authentication required.', 401);
    const orders = await Order.find({ email: req.user.email.toLowerCase() })
      .sort({ createdAt: -1 })
      .lean();
    return success(res, orders);
  } catch (err) {
    return error(res, 'Failed to fetch orders.', 500);
  }
};

exports.getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return error(res, 'Email is required.', 400);

    const orders = await Order.find({ email: email.toLowerCase().trim() }).sort({ createdAt: -1 });
    return success(res, orders);
  } catch (err) {
    return error(res, 'Failed to fetch user orders.', 500);
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return error(res, 'Order not found.', 404);

    await writeAudit({
      action: 'order.delete',
      resourceType: 'order',
      resourceId: deleted._id,
      performedBy: req.user?.email || 'unknown',
      metadata: { status: deleted.status },
    });

    return success(res, null, 'Order deleted successfully.');
  } catch (err) {
    return error(res, 'Failed to delete order.', 500);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return error(res, 'Invalid status.', 400);

    const order = await Order.findById(req.params.id);
    if (!order) return error(res, 'Order not found.', 404);

    const previous = order.status;
    order.status = status;
    await order.save();

    await writeAudit({
      action: 'order.status_update',
      resourceType: 'order',
      resourceId: order._id,
      performedBy: req.user?.email || 'unknown',
      metadata: { from: previous, to: status },
    });

    return success(res, order, 'Order status updated.');
  } catch (err) {
    return error(res, 'Failed to update order.', 500);
  }
};

exports.filterOrdersByDate = async (req, res) => {
  try {
    const { start, end, email } = req.query;
    if (!start || !end) return error(res, 'Start and end dates are required.', 400);

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const query = { createdAt: { $gte: startDate, $lte: endDate } };
    if (email) query.email = email.trim().toLowerCase();

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return success(res, orders);
  } catch (err) {
    return error(res, 'Failed to filter orders.', 500);
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return error(res, 'Order not found.', 404);

    const isOwner = req.user?.email?.toLowerCase() === order.email.toLowerCase();
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) return error(res, 'Access denied.', 403);

    return success(res, order);
  } catch (err) {
    return error(res, 'Could not fetch order.', 500);
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await DiscountSubscriber.findOne({
      couponCode: { $regex: new RegExp(`^${escapeRegex(code.trim())}$`, 'i') },
    });
    if (!coupon) return error(res, 'Invalid coupon code.', 404);
    return success(res, { code: coupon.couponCode, discountPercent: 50 });
  } catch (err) {
    return error(res, 'Could not validate coupon.', 500);
  }
};
