// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Endpoint to serve the JSON file
app.get('/visited-pages', (req, res) => {
  const jsonPath = path.join(__dirname, 'visitedArticles.json');

  if (fs.existsSync(jsonPath)) {
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    res.json(JSON.parse(jsonData));
  } else {
    console.error('Visited pages file not found');
    res.json({ error: 'Visited pages file not found' });
  }
});

let existingData = [];


// setInterval(() => {

//   fs.readFile('visitedArticles.json', 'utf8', (err, data) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     if (data) {
//       existingData = JSON.parse(data);
//     }
// });

//   io.emit('jsonArrayUpdate', existingData);
// }, 1000);





server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
