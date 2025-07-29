const express = require("express");
const Sensor = require("../models/Sensor");

const router = express.Router();

    router.get("/", async (_req, res) => {
        try {
            const sensor = await Sensor.find();
            res.json(sensor);
        } catch (error) {
            console.error("GET /sensors", error);
            res.status(500).json({ error: "Error getting boxs" });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const sensor = new Sensor({
                _id: req.body._id,
                type: req.body.type,
                status: req.body.status,
            });
            await sensor.save();
            res.status(201).json(sensor);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: 'Error saving Sensor' });
        }
    });

    router.get("/Active", async (_req, res) => {
        try {
            const sensors = await Sensor.find({ status: 'Active' })
            res.json(sensors);
        } catch (error) {
            console.error("GET /sensors", error);
            res.status(500).json({ error: "Error getting sensors" });
        }
    });

module.exports = router;
