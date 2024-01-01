// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const wikiRouter = require('./routes/wiki');
const http = require('http');
const setupSocket = require('./socket');

const app = express();
const port = process.env.PORT || 3001;
const server = http.createServer(app);
const io = setupSocket(server);

app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, 'client/build')));

// Use the wikiRouter for Wikipedia-related routes
app.use('/wiki', wikiRouter(io));

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});