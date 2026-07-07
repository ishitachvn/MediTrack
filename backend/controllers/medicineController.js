// controllers/medicineController.js
const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');

// @desc    Add a new medicine
// @route   POST /api/medicines
// @access  Private
const addMedicine = asyncHandler(async (req, res) => {
  const {
    medicineName,
    dosage,
    frequency,
    time,
    startDate,
    endDate,
    instructions,
    shape,
    color,
    history,
  } = req.body;

  const medicine = await Medicine.create({
    userId: req.user,
    medicineName,
    dosage,
    frequency,
    time,
    startDate,
    endDate,
    instructions,
    shape,
    color,
    history,
  });

  res.status(201).json(medicine);
});

// @desc    Get all medicines for logged‑in user (optional filters)
// @route   GET /api/medicines
// @access  Private
const getMedicines = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const query = { userId: req.user };
  if (status) query.status = status;
  if (search) query.medicineName = { $regex: search, $options: 'i' };
  const medicines = await Medicine.find(query).sort({ createdAt: -1 });
  res.json(medicines);
});

// @desc    Get a single medicine by ID
// @route   GET /api/medicines/:id
// @access  Private
const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, userId: req.user });
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  res.json(medicine);
});

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private
const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, userId: req.user });
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  // only allow specified fields to be updated
  const updatable = ['medicineName', 'dosage', 'frequency', 'time', 'startDate', 'endDate', 'status', 'instructions', 'shape', 'color', 'history'];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) medicine[field] = req.body[field];
  });
  await medicine.save();
  res.json(medicine);
});

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, userId: req.user });
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  await medicine.deleteOne();
  res.json({ message: 'Medicine removed' });
});

// @desc    Mark medicine as taken (or missed)
// @route   PUT /api/medicines/:id/taken
// @access  Private
const markMedicineTaken = asyncHandler(async (req, res) => {
  const { status } = req.body; // expected "taken" or "missed"
  if (!['taken', 'missed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }
  const medicine = await Medicine.findOne({ _id: req.params.id, userId: req.user });
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  medicine.status = status;
  await medicine.save();
  res.json(medicine);
});

module.exports = {
  addMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  markMedicineTaken,
};
