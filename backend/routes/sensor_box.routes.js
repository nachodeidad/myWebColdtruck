const express = require("express");
const Sensor_Box = require("../models/Sensor_Box");

const router = express.Router();
    router.get("/", async (_req, res) => {
        try {
            const sensor_box = await Sensor_Box.find();
            res.json(sensor_box);
        } catch (error) {
            console.error("GET /sensors_boxs", error);
            res.status(500).json({ error: "Error getting boxs" });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const sensor_box = new Sensor_Box({
                IDSensor: req.body.IDSensor,
                IDBox: req.body.IDBox,
                dateStart: req.body.dateStart,
            });
            await sensor_box.save();
            res.status(201).json(sensor_box);
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: 'Error saving sensor_box' });
        }
    });

module.exports = router;
