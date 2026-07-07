// models/Medicine.js
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true }, // e.g., "500 mg"
    frequency: { type: String, required: true }, // e.g., "Twice a day"
    time: { type: String, required: true }, // e.g., "08:00,20:00"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'taken', 'missed'], default: 'pending' },
    instructions: { type: String, default: '' },
    shape: { type: String, default: 'tablet' },
    color: { type: String, default: 'blue' },
    history: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
