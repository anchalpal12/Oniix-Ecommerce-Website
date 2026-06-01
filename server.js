const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const User = require('./models/User');
const { setEmitUserCount } = require('./utils/socketEvents');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [env.clientUrl, 'http://localhost:5000'],
    methods: ['GET', 'POST'],
  },
});

global._io = io;

async function emitUserCount() {
  try {
    const count = await User.countDocuments();
    io.emit('userCountUpdated', { count });
  } catch (err) {
    logger.warn({ err }, 'Failed to emit user count');
  }
}

setEmitUserCount(emitUserCount);

io.on('connection', (socket) => {
  logger.debug({ socketId: socket.id }, 'Client connected');
  emitUserCount();
  socket.on('disconnect', () => logger.debug({ socketId: socket.id }, 'Client disconnected'));
});

async function start() {
  await mongoose.connect(env.mongodbUri);
  logger.info('MongoDB connected');
  await emitUserCount();

  server.listen(env.port, () => {
    logger.info({ port: env.port, clientUrl: env.clientUrl }, 'API server running');
  });
}

function shutdown(signal) {
  logger.info({ signal }, 'Shutting down gracefully');
  server.close(async () => {
    await mongoose.connection.close(false);
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

if (require.main === module) {
  start().catch((err) => {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  });
}

module.exports = { app, server, start };
