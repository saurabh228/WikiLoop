// routes/wiki.js
const express = require('express');
const router = express.Router();
const { calculatePath } = require('../services/wikipediaService');


module.exports = function(io){
  
  router.post('/calculatePath', async (req, res) => {
    const { url } = req.body;
    try {
      // Pass io instance to calculatePath function
      const results = await calculatePath(url, io);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
