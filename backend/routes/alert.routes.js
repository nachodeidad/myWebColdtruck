const express = require('express');
const Alert = require('../models/Alert');
const Trip = require('../models/Trip');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('GET /alerts', error);
    res.status(500).json({ error: 'Error getting alerts' });
  }
});

// Alerts grouped by truck using trip information
router.get('/byTruck', async (_req, res) => {
  try {
    const trips = await Trip.find({ 'alerts.0': { $exists: true } }).populate('IDTruck');
    const result = trips.map((t) => ({
      truck: t.IDTruck,
      alerts: t.alerts,
    }));
    res.json(result);
  } catch (error) {
    console.error('GET /alerts/byTruck', error);
    res.status(500).json({ error: 'Error getting alerts by truck' });
  }
});

module.exports = router;
