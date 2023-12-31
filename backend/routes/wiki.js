// routes/wiki.js
const express = require('express');
const router = express.Router();
const { getFirstLink, calculatePath } = require('../services/wikipediaService');

router.post('/calculatePath', async (req, res) => {
  const { url } = req.body;
  try {
    const results = await calculatePath(url);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
