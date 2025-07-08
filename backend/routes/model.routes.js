const express = require("express")
const Model   = require('../models/Model');

const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            const filter = req.query.IDBrand ? { IDBrand: req.query.IDBrand } : {};
            const models = await Model.find(filter).sort('name');
            res.json(models);
        } catch (error) {
            res.status(500).json({ error: 'Error getting models' });
        }
    });

    router.get("/", async (req, res) => {
        try {
            const { IDBrand } = req.query;
            const filter = IDBrand ? { IDBrand: Number(IDBrand) } : {};

            const models = await Model.find(filter).sort("name");
            res.json(models);
        } catch (error) {
            console.error("GET /models", error);
            res.status(500).json({ error: "Error getting models" });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const model = new Model({
            name: req.body.name,
            IDBrand: req.body.IDBrand,
            });
            await model.save();
            res.status(201).json(model);
        } catch (error) {
            res.status(400).json({ error: 'Error saving model' });
        }
    });

    router.post("/", async (req, res) => {
    try {
        const { name, IDBrand } = req.body;
        const model = new Model({ name, IDBrand });
        const saved = await model.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: "Error saving model" });
    }
    });

module.exports = router