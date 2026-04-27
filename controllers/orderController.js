require('dotenv').config(); // ✅ Make sure this is first
const Order = require('../models/Order');
const { Resend } = require('resend');

// ✅ Initialize Resend safely
const resend = new Resend(process.env.RESEND_API_KEY || '');

// ✅ Generate Invoice HTML
function generateInvoiceHTML(order) {
  return `
    <h2 style="color:#333;">Invoice</h2>
    <p>Hi <strong>${order.name}</strong>,</p>
    <p>Thank you for your order! Here's your invoice:</p>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
    <p><strong>Address:</strong> ${order.address}</p>
    <h4>Items:</h4>
    <ul>
      ${order.cart.map(item => `<li>${item.name} x${item.quantity || 1} - ₹${item.price}</li>`).join('')}
    </ul>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <hr />
    <p>Regards,<br>Your Company Name</p>
  `;
}

// ✅ Place Order & Send Invoice
exports.placeOrder = async (req, res) => {
  try {
    const { name, email, address, items, totalAmount } = req.body;

    if (!name || !email || !address || !items || !totalAmount) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const newOrder = new Order({
      name,
      email,
      address,
      cart: items,
      totalAmount,
      createdAt: new Date()
    });

    await newOrder.save();

    const invoiceHTML = generateInvoiceHTML(newOrder);

    // ✅ Send email via Resend API
    try {
      const sendResult = await resend.emails.send({
        from: `Your Company <${process.env.RESEND_FROM_EMAIL}>`,
        to: email,
        subject: 'Your Order Invoice',
        html: invoiceHTML,
      });

      if (sendResult?.error) {
        console.error('❌ Email sending failed:', sendResult.error);
      } else {
        console.log(`✅ Invoice email sent to ${email}`);
      }
    } catch (emailErr) {
      console.error('❌ Resend API error:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: newOrder
    });

  } catch (error) {
    console.error('❌ Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order.',
      error: error.message
    });
  }
};

// ✅ Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.', error: error.message });
  }
};

// ✅ Get Orders by Email
exports.getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required in query.' });
    }

    const orders = await Order.find({ email }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user orders.', error: error.message });
  }
};

// ✅ Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({ success: true, message: 'Order deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete order.', error: error.message });
  }
};

// ✅ Filter Orders by Date Range
exports.filterOrdersByDate = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required.' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to filter orders.', error: error.message });
  }
};
