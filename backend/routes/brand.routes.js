const express = require("express");
const Brand = require("../models/Brand");

const router = express.Router();

router.get("/", async (_req, res) => {
    try {
        const brands = await Brand.find().sort("name");
        res.json(brands);
    } catch (error) {
        console.error("GET /brands", error);
        res.status(500).json({ error: "Error getting brands" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({ error: "Name is required" });
        }

        const exists = await Brand.findOne({ name: new RegExp(`^${name}$`, "i") });
        if (exists) {
            return res.status(409).json({ error: "Brand already exists" });
        }

        const brand  = new Brand({ name: name.trim() });
        const saved  = await brand.save();
        res.status(201).json(saved);
    } catch (error) {
        console.error("POST /brands", error);
        res.status(500).json({ error: "Error saving brand" });
    }
});

module.exports = router;
