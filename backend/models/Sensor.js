const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema(
    {
        _id: { type: String, unique: true },
        type: {
            type: String,
            required: true,
            enum: ['Temperature', 'Humidity', 'Temp&Hum']
        },
        status: {
            type: String,
            required: true,
            enum: ['Active', 'Out of Service']
        }
    }
);

module.exports = mongoose.model('Sensor', SensorSchema, 'sensor');
