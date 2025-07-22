const express = require('express');
const Rute = require('../models/Rute');
const Trip = require('../models/Trip');

const router = express.Router();

async function getDistance(origin, destination) {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': process.env.ORS_API_KEY || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            coordinates: [origin, destination]
        })
    });

    const data = await response.json();
    console.log('ORS response:', JSON.stringify(data));

    if (!data.routes || !data.routes[0] || !data.routes[0].summary || typeof data.routes[0].summary.distance !== 'number') {
        throw new Error('Invalid OpenRouteService response: ' + JSON.stringify(data));
    }
    return data.routes[0].summary.distance;
}


router.get('/', async (_req, res) => {
    try {
        const trips = await Trip.find();
        res.json(trips);
    } catch (err) {
        res.status(500).json({ error: 'Error getting trips' });
    }
});

router.get('/specific', async (_req, res) => {
    try {
        const trips = await Trip
        .find()
        .populate('IDDriver IDAdmin IDBox IDRute IDTruck IDCargoType');
        return res.json(trips);
    } catch (err) {
        console.error('Error getting trips:', err);
        return res.status(500).json({ error: 'Error getting trips' });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            scheduledDepartureDate,
            scheduledArrivalDate,
            IDDriver,
            IDAdmin,
            IDBox,
            IDRute,
            IDTruck,
            IDCargoType
        } = req.body;

        const rute = await Rute.findById(Number(IDRute));
        if (!rute) {
            return res.status(404).json({ error: 'Route not found' });
        }

        // Validar estructura de coordenadas antes de llamar la API
        if (
            !rute.origin ||
            !Array.isArray(rute.origin.coordinates) ||
            rute.origin.coordinates.length !== 2 ||
            !rute.destination ||
            !Array.isArray(rute.destination.coordinates) ||
            rute.destination.coordinates.length !== 2
        ) {
            console.error('Invalid route coordinates:', rute);
            return res.status(400).json({ error: 'Invalid route coordinates' });
        }

        // Asegúrate que sean números
        const originCoords = rute.origin.coordinates.map(Number);
        const destinationCoords = rute.destination.coordinates.map(Number);

        // Logs para depuración
        console.log('Origin:', originCoords);
        console.log('Destination:', destinationCoords);

        // Llama a la API de rutas
        const distance = await getDistance(originCoords, destinationCoords);

        const trip = new Trip({
            scheduledDepartureDate,
            scheduledArrivalDate,
            estimatedDistance: distance,
            status: 'Scheduled',
            IDDriver,
            IDAdmin,
            IDBox,
            IDRute,
            IDTruck,
            IDCargoType
        });

        const saved = await trip.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('POST /trips', err);
        res.status(400).json({ error: 'Error creating trip', details: err.message });
    }
});

module.exports = router;
