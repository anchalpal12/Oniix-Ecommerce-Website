const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const PendingCheckout = require('../models/PendingCheckout');
const DiscountSubscriber = require('../models/DiscountSubscriber');
const AppError = require('../utils/AppError');
const escapeRegex = require('../utils/escapeRegex');
const logger = require('../utils/logger');
const { getResendClient, sendOrderInvoice } = require('./orderNotifications');

function normalizeItems(rawItems) {
  return (rawItems || []).map((item) => ({
    productId: item._id || item.productId || item.id,
    name: item.name,
    price: parseFloat(item.price),
    quantity: item.quantity || 1,
    imageUrl: item.imageUrl,
  }));
}

async function computeOrderTotals(normalizedItems, couponCode, shippingFee) {
  const computedTotal = normalizedItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  let finalTotal = computedTotal;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await DiscountSubscriber.findOne({
      couponCode: {
        $regex: new RegExp(`^${escapeRegex(couponCode.trim())}$`, 'i'),
      },
    });
    if (coupon) {
      finalTotal = Math.round(computedTotal * 0.5 * 100) / 100;
      appliedCoupon = coupon.couponCode;
    }
  }

  const shipping = Math.max(0, parseFloat(shippingFee) || 0);
  const expectedTotal = Math.round((finalTotal + shipping) * 100) / 100;

  return { expectedTotal, shipping, appliedCoupon, computedTotal };
}

async function validateStock(normalizedItems) {
  for (const item of normalizedItems) {
    if (!item.productId) continue;
    const product = await Product.findById(item.productId);
    if (product && product.stock < (item.quantity || 1)) {
      throw new AppError(
        `${product.name} is out of stock or insufficient quantity.`,
        400
      );
    }
  }
}

async function supportsTransactions() {
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    return Boolean(hello.setName);
  } catch {
    return false;
  }
}

async function createOrderSequential(orderPayload) {
  const order = await Order.create(orderPayload);
  const restored = [];

  try {
    for (const item of orderPayload.items) {
      if (!item.productId) continue;
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity || 1 } },
        { $inc: { stock: -(item.quantity || 1) } },
        { new: true }
      );
      if (!updated) {
        throw new AppError('Insufficient stock for one or more items.', 400);
      }
      restored.push({ id: item.productId, qty: item.quantity || 1 });
    }

    sendOrderInvoice(order).catch((err) => {
      logger.warn({ err: err.message, orderId: order._id }, 'Invoice email failed');
    });

    return order;
  } catch (err) {
    await Order.findByIdAndDelete(order._id);
    for (const entry of restored) {
      await Product.findByIdAndUpdate(entry.id, { $inc: { stock: entry.qty } });
    }
    throw err;
  }
}

async function createOrderWithTransaction(orderPayload) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const [order] = await Order.create([orderPayload], { session });

    for (const item of orderPayload.items) {
      if (!item.productId) continue;
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity || 1 } },
        { $inc: { stock: -(item.quantity || 1) } },
        { session, new: true }
      );
      if (!updated) {
        throw new AppError('Insufficient stock for one or more items.', 400);
      }
    }

    await session.commitTransaction();

    sendOrderInvoice(order).catch((err) => {
      logger.warn({ err: err.message, orderId: order._id }, 'Invoice email failed');
    });

    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function createOrderWithStock(orderPayload) {
  if (await supportsTransactions()) {
    return createOrderWithTransaction(orderPayload);
  }
  return createOrderSequential(orderPayload);
}

async function buildOrderPayload(body) {
  const { name, email, address, items, totalAmount, couponCode, paymentMethod, phone, shippingFee } =
    body;

  const normalizedItems = normalizeItems(items);
  await validateStock(normalizedItems);

  const { expectedTotal, shipping, appliedCoupon } = await computeOrderTotals(
    normalizedItems,
    couponCode,
    shippingFee
  );

  if (Math.abs(expectedTotal - parseFloat(totalAmount)) > 1) {
    throw new AppError('Order total mismatch. Please refresh and try again.', 400);
  }

  return {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim(),
    address: address.trim(),
    items: normalizedItems,
    totalAmount: expectedTotal,
    shippingFee: shipping,
    couponCode: appliedCoupon,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
    status: 'pending',
  };
}

async function fulfillStripeSession(stripeSessionId) {
  const existing = await Order.findOne({ stripeSessionId }).lean();
  if (existing) return existing;

  const pending = await PendingCheckout.findOne({ stripeSessionId });
  if (!pending) {
    throw new AppError('Checkout session not found.', 404);
  }

  if (pending.status === 'completed' && pending.orderId) {
    return Order.findById(pending.orderId).lean();
  }

  const orderPayload = {
    name: pending.name,
    email: pending.email,
    phone: pending.phone,
    address: pending.address,
    items: pending.items,
    totalAmount: pending.totalAmount,
    shippingFee: pending.shippingFee,
    couponCode: pending.couponCode,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'pending',
    stripeSessionId,
  };

  const order = await createOrderWithStock(orderPayload);

  pending.status = 'completed';
  pending.orderId = order._id;
  await pending.save();

  return order.toObject ? order.toObject() : order;
}

module.exports = {
  normalizeItems,
  computeOrderTotals,
  validateStock,
  createOrderWithStock,
  buildOrderPayload,
  fulfillStripeSession,
};
