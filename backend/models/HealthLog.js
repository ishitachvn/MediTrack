// models/HealthLog.js
const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    waterIntake: { type: Number, required: true, default: 0 }, // in milliliters
    exerciseMinutes: { type: Number, required: true, default: 0 },
    sleepHours: { type: Number, required: true, default: 0 },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthLog', healthLogSchema);
