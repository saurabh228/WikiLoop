// socket.js
const { Server } = require('socket.io');
const fs = require('fs');

// Function to set up Socket.IO with event handling
function setupSocket(server) {
  // Create a new Socket.IO server instance
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000', // Allow connections from this origin
      methods: ['GET', 'POST'], // Allow specified HTTP methods
    },
  });

  // Event handling when a new client connects
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Clear data in 'visitedArticles.json' file when a user connects
    fs.writeFile('visitedArticles.json', "", (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Data has been cleared");
    });

    // Event handling when a client disconnects
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // Return the configured Socket.IO instance
  return io;
}

// Export the setupSocket function for use in other modules
module.exports = setupSocket;
