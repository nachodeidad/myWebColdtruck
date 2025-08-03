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

router.get('/averages/today', async (_req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const readings = await SensorReading.find({
            dateTime: { $gte: startOfDay, $lte: endOfDay }
        });

        // Agrupar por hora
        const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            tempSum: 0,
            humSum: 0,
            count: 0
        }));

        readings.forEach(reading => {
            const hour = new Date(reading.dateTime).getUTCHours();
            hourlyData[hour].tempSum += reading.tempReadingValue || 0;
            hourlyData[hour].humSum += reading.humReadingValue || 0;
            hourlyData[hour].count += 1;
        });

        const result = hourlyData.map(item => ({
            hour: `${item.hour.toString().padStart(2, '0')}:00`,
            temperature: item.count ? item.tempSum / item.count : 0,
            humidity: item.count ? item.humSum / item.count : 0
        }));

        return res.json(result);
    } catch (error) {
        console.error('Error calculating hourly averages:', error);
        return res.status(500).json({ error: 'Error generating average data' });
    }
});


module.exports = router;