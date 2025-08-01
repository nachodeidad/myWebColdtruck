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

router.get("/box/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const sensorBoxes = await Sensor_Box.find({ IDBox: parseInt(id) })
            .populate([{ path: "IDSensor" }, { path: "IDBox" }]);

        if (sensorBoxes.length === 0) {
            return res.status(404).json({ message: "No assignments found for this box ID." });
        }

        res.json(sensorBoxes);
    } catch (error) {
        console.error(`GET /sensor_box/box/${req.params.id}`, error);
        res.status(500).json({ error: "Error fetching assignments for this box." });
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
        console.log("Intentando guardar:", {
            IDSensor: req.body.IDSensor,
            IDBox: req.body.IDBox,
            dateStart: req.body.dateStart
        });
    } catch (error) {
        console.error("❌ Error saving sensor_box:", JSON.stringify(error, null, 2));
        res.status(400).json({ error: 'Error saving sensor_box' });
    }

});

router.get("/available-sensors", async (_req, res) => {
    try {
        const sensors = await Sensor.aggregate([
            { $match: { status: "Active" } },
            {
                $lookup: {
                    from: "sensor_box",
                    localField: "_id",
                    foreignField: "IDSensor",
                    as: "assignments"
                }
            },
            {
                $match: {
                    assignments: {
                        $not: {
                            $elemMatch: { dateEnd: null }
                        }
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    _id: 1,
                    type: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        res.json(sensors);
    } catch (error) {
        console.error("GET /available-sensors", error);
        res.status(500).json({ error: "Error getting available sensors" });
    }
});


router.put("/deassign/:boxId", async (req, res) => {
    try {
        const closed = await Sensor_Box.findOneAndUpdate(
            { IDBox: parseInt(req.params.boxId), dateEnd: null },
            { dateEnd: new Date() },
            { new: true }
        );

        if (!closed) {
            return res.status(404).json({ error: "No active assignment found for this box." });
        }

        res.json(closed);
    } catch (error) {
        console.error("Error during deassignment:", error);
        res.status(500).json({ error: "Failed to deassign sensor." });
    }
});



router.put("/change-sensor/:boxId", async (req, res) => {
    try {
        const { boxId } = req.params;
        const { newSensorId } = req.body;

        const boxIdNum = parseInt(boxId);
        if (!newSensorId || typeof newSensorId !== "string") {
            return res.status(400).json({ error: "newSensorId is required" });
        }

        // LOG: Buscar relación activa
        const activeAssignment = await Sensor_Box.findOne({ IDBox: boxIdNum, dateEnd: null });
        console.log("🟡 Relación activa encontrada:", activeAssignment);

        // Intentar cerrar
        const closed = await Sensor_Box.findOneAndUpdate(
            { IDBox: boxIdNum, dateEnd: null },
            { dateEnd: new Date() },
            { new: true }
        );

        if (!closed) {
            console.log("⚠️ No se encontró relación activa para cerrar.");
        } else {
            console.log("✅ Relación cerrada:", closed);
        }

        // Crear nueva relación
        const newAssignment = await Sensor_Box.create({
            IDBox: boxIdNum,
            IDSensor: newSensorId,
            dateStart: new Date(),
            dateEnd: null
        });

        res.status(201).json(newAssignment);
    } catch (error) {
        console.error("❌ Error changing sensor:", error);
        res.status(500).json({ error: "Failed to change sensor" });
    }
});





module.exports = router;
