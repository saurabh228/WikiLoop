// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const setupSocket = require('./socket');
const wikiRouter = require('./routes/wiki');

const app = express();
const port = process.env.PORT || 3001;

// Create an HTTP server instance
const server = http.createServer(app);

// Set up Socket.IO for real-time communication
const io = setupSocket(server);

// Middleware
app.use(bodyParser.json());

// Enable CORS with specific origins and credentials
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// Serve static files from the 'client/build' directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Use the wikiRouter for Wikipedia-related routes, passing the Socket.IO instance
app.use('/wiki', wikiRouter(io));

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
