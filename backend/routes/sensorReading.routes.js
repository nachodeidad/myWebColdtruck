const express = require('express');
const SensorReading = require('../models/SensorReading');
const Trip = require('../models/Trip');
const Alert = require('../models/Alert');

const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        const readings = await SensorReading.find();
        res.json(readings);
    } catch (error) {
        console.error('GET /sensor_readings', error);
        res.status(500).json({ error: 'Error getting sensor readings' });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            tempReadingValue,
            humReadingValue,
            IDSensor,
            IDTrip
        } = req.body;

        const reading = new SensorReading({
            tempReadingValue,
            humReadingValue,
            IDSensor,
            IDTrip,
            dateTime: new Date()
        });

        await reading.save();

        if (IDTrip) {
            const trip = await Trip.findById(Number(IDTrip));
            if (trip) {
                let alertType = null;
                if (typeof tempReadingValue === 'number' && tempReadingValue > 30) {
                    alertType = 'High Temperature';
                } else if (typeof tempReadingValue === 'number' && tempReadingValue < 0) {
                    alertType = 'Low Temperature';
                }
                if (alertType) {
                    const alert = await Alert.findOne({ type: alertType });
                    if (alert) {
                        trip.alerts.push({
                            IDAlert: alert._id,
                            dateTime: new Date(),
                            temperature: tempReadingValue,
                            humidity: humReadingValue
                        });
                        await trip.save();
                    }
                }
            }
        }

        res.status(201).json(reading);
    } catch (error) {
        console.error('POST /sensor_readings', error);
        res.status(400).json({ error: 'Error saving sensor reading' });
    }
});

module.exports = router;
