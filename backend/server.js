// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const wikiRouter = require('./routes/wiki');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors()); // Enable CORS
app.use(express.static(path.join(__dirname, 'client/build')));

// Use the wikiRouter for Wikipedia-related routes
app.use('/wiki', wikiRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
