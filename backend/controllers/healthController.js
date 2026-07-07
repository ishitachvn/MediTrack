// controllers/healthController.js
const asyncHandler = require('express-async-handler');
const HealthLog = require('../models/HealthLog');

// @desc    Add a daily health log (or update if same date exists)
// @route   POST /api/health
// @access  Private
const addHealthLog = asyncHandler(async (req, res) => {
  const { waterIntake, exerciseMinutes, sleepHours, date } = req.body;
  const logDate = date ? new Date(date) : new Date();

  // Check if a log already exists for this user on the same calendar day
  const startOfDay = new Date(logDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(logDate.setHours(23, 59, 59, 999));

  let log = await HealthLog.findOne({
    userId: req.user,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (log) {
    // Update existing log
    if (waterIntake !== undefined) log.waterIntake = waterIntake;
    if (exerciseMinutes !== undefined) log.exerciseMinutes = exerciseMinutes;
    if (sleepHours !== undefined) log.sleepHours = sleepHours;
    await log.save();
    return res.json(log);
  }

  // Create new log
  log = await HealthLog.create({
    userId: req.user,
    waterIntake: waterIntake || 0,
    exerciseMinutes: exerciseMinutes || 0,
    sleepHours: sleepHours || 0,
    date: logDate,
  });
  res.status(201).json(log);
});

// @desc    Get health history (optionally filter by date range)
// @route   GET /api/health
// @access  Private
const getHealthLogs = asyncHandler(async (req, res) => {
  const { start, end } = req.query; // expected ISO strings
  const query = { userId: req.user };
  if (start || end) {
    query.date = {};
    if (start) query.date.$gte = new Date(start);
    if (end) query.date.$lte = new Date(end);
  }
  const logs = await HealthLog.find(query).sort({ date: -1 });
  res.json(logs);
});

// @desc    Update a specific health log by its ID
// @route   PUT /api/health/:id
// @access  Private
const updateHealthLog = asyncHandler(async (req, res) => {
  const { waterIntake, exerciseMinutes, sleepHours, date } = req.body;
  const log = await HealthLog.findOne({ _id: req.params.id, userId: req.user });
  if (!log) {
    res.status(404);
    throw new Error('Health log not found');
  }
  if (waterIntake !== undefined) log.waterIntake = waterIntake;
  if (exerciseMinutes !== undefined) log.exerciseMinutes = exerciseMinutes;
  if (sleepHours !== undefined) log.sleepHours = sleepHours;
  if (date) log.date = new Date(date);
  await log.save();
  res.json(log);
});

module.exports = {
  addHealthLog,
  getHealthLogs,
  updateHealthLog,
};
