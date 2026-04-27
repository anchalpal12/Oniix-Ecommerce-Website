const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');
const newsletterRoutes = require('./routes/newsletterRoutes');
const discountRoutes = require('./routes/discountRoutes'); // Adjust path as needed
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');



require('dotenv').config();





const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/newsletter-subscribers', require('./routes/newsletterRoutes'));
app.use('/api/discount-subscribers', require('./routes/discountRoutes'));
app.use('/api/products', productRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/orders', orderRoutes);


// Global reference
global._io = io;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/Onix', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  emitUserCount();
})
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id);
  emitUserCount();

  socket.on('disconnect', () => {
    console.log('❎ Client disconnected:', socket.id);
  });
});

async function emitUserCount() {
  try {
    const count = await User.countDocuments();
    io.emit('userCountUpdated', { count });
  } catch (err) {
    console.error('❗ Error emitting user count:', err.message);
  }
}

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
