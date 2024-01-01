// socket.js
const { Server } = require('socket.io');
const fs = require('fs');

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
          origin: 'http://localhost:3000',
          methods:['GET','POST']
        }
      });

  io.on('connection', (socket) => {
    console.log('A user connected');

    fs.writeFile('visitedArticles.json', "", (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Data has been cleared");
    });


    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
}

module.exports = setupSocket;
