let io = null;

function setupSocket(server) {
  const socketIo = require('socket.io');
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

function emitUserCount(count) {
  if (io) {
    io.emit('userCountUpdated', { count });
  }
}

module.exports = {
  setupSocket,
  emitUserCount,
};
