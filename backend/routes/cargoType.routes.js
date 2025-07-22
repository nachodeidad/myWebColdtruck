const express = require("express");
const CargoType = require("../models/CargoType");

const router = express.Router();

    router.get("/", async (_req, res) => {
        try {
            const cargoType = await CargoType.find();
            res.json(cargoType);
        } catch (error) {
            console.error("GET /cargoTypes", error);
            res.status(500).json({ error: "Error getting boxs" });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const cargo = new CargoType({
            name: req.body.name,
            description: req.body.description,
            });
            await cargo.save();
            res.status(201).json(cargo);
        } catch (error) {
            res.status(400).json({ error: 'Error saving Cargo Type' });
        }
    });

module.exports = router;
