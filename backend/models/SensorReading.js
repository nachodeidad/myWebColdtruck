const mongoose = require('mongoose');
const autoIncrementId = require('../plugins/autoIncrementId');

const SensorReadingSchema = new mongoose.Schema(
  {
    _id: { type: Number, unique: true },
    tempReadingValue: { type: Number, required: true },
    humReadingValue: { type: Number, required: true },
    dateTime: { type: Date, required: true },
    IDSensor: { type: String, required: true, ref: 'Sensor' },
    IDTrip: { type: Number, ref: 'Trip' },
  },
  { timestamps: true, _id: false }
);

SensorReadingSchema.pre('save', autoIncrementId('SensorReading'));

module.exports = mongoose.model('SensorReading', SensorReadingSchema, 'sensorReading');
