const express = require('express');

const analyticsService = require('../services/analyticsService');

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const { from, to } = req.query;
    const summary = await analyticsService.getSummary({ from, to });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load summary', error: String(err?.message || err) });
  }
});

router.get('/occupancy', async (req, res) => {
  try {
    const { from, to } = req.query;
    const series = await analyticsService.getOccupancySeries({ from, to });
    res.json(series);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load occupancy series', error: String(err?.message || err) });
  }
});

router.get('/events', async (req, res) => {
  try {
    const { from, to } = req.query;
    const series = await analyticsService.getEventsSeries({ from, to });
    res.json(series);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load event series', error: String(err?.message || err) });
  }
});

module.exports = router;

