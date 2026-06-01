const env = require('../config/env');
const logger = require('../utils/logger');

let resendClient = null;

function getResendClient() {
  if (!env.resendApiKey) return null;
  if (!resendClient) {
    const { Resend } = require('resend');
    resendClient = new Resend(env.resendApiKey);
  }
  return resendClient;
}

function getOrderItems(order) {
  return order.items?.length ? order.items : order.cart || [];
}

function generateInvoiceHTML(order) {
  const items = getOrderItems(order);
  return `
    <h2 style="color:#333;">Invoice — Onix</h2>
    <p>Hi <strong>${order.name}</strong>,</p>
    <p>Thank you for your order!</p>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Total:</strong> ₹${order.totalAmount.toFixed(2)}</p>
    <p><strong>Address:</strong> ${order.address}</p>
    <h4>Items:</h4>
    <ul>
      ${items.map((item) => `<li>${item.name} x${item.quantity || 1} — ₹${item.price}</li>`).join('')}
    </ul>
    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
  `;
}

async function sendOrderInvoice(order) {
  const resend = getResendClient();
  if (!resend || !env.resendFromEmail) return;

  await resend.emails.send({
    from: `Onix <${env.resendFromEmail}>`,
    to: order.email,
    subject: 'Your Onix Order Invoice',
    html: generateInvoiceHTML(order),
  });
}

module.exports = { getResendClient, sendOrderInvoice, generateInvoiceHTML };
