const express = require("express");
const Sensor_Box = require("../models/Sensor_Box");
const Sensor = require('../models/Sensor')

const router = express.Router();
router.get("/", async (_req, res) => {
    try {
        const sensor_box = await Sensor_Box.find().populate([{ path: "IDSensor" }, { path: "IDBox" }]);
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

router.get("/available-sensors", async (_req, res) => {
    try {
        const activeSensors = await Sensor.find({ status: "Active" });

        const sensorBoxes = await Sensor_Box.find({}, "IDSensor");
        const usedSensorIds = sensorBoxes.map(sb => sb.IDSensor);

        const availableSensors = activeSensors.filter(
            sensor => !usedSensorIds.includes(sensor._id)
        );

        res.json(availableSensors);
    } catch (error) {
        console.error("GET /available-sensors", error);
        res.status(500).json({ error: "Error getting available sensors" });
    }
});

router.put("/change-sensor/:boxId", async (req, res) => {
    try {
        const { boxId } = req.params;
        const { newSensorId } = req.body;

        if (!newSensorId) {
            return res.status(400).json({ error: "newSensorId is required" });
        }

        await Sensor_Box.findOneAndUpdate(
            { IDBox: boxId, dateEnd: null },
            { dateEnd: new Date() }
        );

        const newAssignment = await Sensor_Box.create({
            IDBox: boxId,
            IDSensor: newSensorId,
            dateStart: new Date(),
            dateEnd: null
        });

        res.json(newAssignment);
    } catch (error) {
        console.error("Error changing sensor:", error);
        res.status(500).json({ error: "Failed to change sensor" });
    }
});



module.exports = router;
