// socket.js
const { Server } = require('socket.io');

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
          origin: 'http://localhost:3000',
          methods:['GET','POST']
        }
      });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
}

module.exports = setupSocket;
