const express = require('express');
const SensorReading = require('../models/SensorReading');
const Sensor = require('../models/Sensor');
const Trip = require('../models/Trip');
const Alert = require('../models/Alert');
const Rute = require('../models/Rute');

const router = express.Router();

// Get all sensor readings
router.get('/', async (_req, res) => {
  try {
    const readings = await SensorReading.find();
    res.json(readings);
  } catch (error) {
    console.error('GET /sensorReadings', error);
    res.status(500).json({ error: 'Error getting sensor readings' });
  }
});

// Create a new sensor reading and generate alert if needed
router.post('/', async (req, res) => {
  try {
    const { tempReadingValue, humReadingValue, dateTime, IDSensor, IDTrip } = req.body;

    const reading = new SensorReading({
      tempReadingValue,
      humReadingValue,
      dateTime,
      IDSensor,
      IDTrip,
    });
    await reading.save();

    // If reading is associated with a trip, check limits
    if (IDTrip) {
      const trip = await Trip.findById(IDTrip).populate('IDRute');
      if (trip && trip.IDRute) {
        const rute = trip.IDRute;
        const alerts = [];
        if (rute.maxTemp !== undefined && tempReadingValue > rute.maxTemp) {
          alerts.push('High Temperature');
        }
        if (rute.minTemp !== undefined && tempReadingValue < rute.minTemp) {
          alerts.push('Low Temperature');
        }
        if (rute.maxHum !== undefined && humReadingValue > rute.maxHum) {
          alerts.push('High Humidity');
        }
        if (rute.minHum !== undefined && humReadingValue < rute.minHum) {
          alerts.push('Low Humidity');
        }

        for (const type of alerts) {
          const alert = new Alert({
            type,
            description: `Trip ${IDTrip}: ${type} detected`,
          });
          await alert.save();

          // also push into trip.alerts with alert details
          trip.alerts.push({
            IDAlert: alert._id,
            type: alert.type,
            description: alert.description,
            dateTime,
            temperature: tempReadingValue,
            humidity: humReadingValue,
          });
        }
        if (alerts.length) {
          await trip.save();
        }
      }
    }

    res.status(201).json(reading);
  } catch (error) {
    console.error('POST /sensorReadings', error);
    res.status(400).json({ error: 'Error saving sensor reading' });
  }
});

module.exports = router;
