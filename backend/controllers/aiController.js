const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');
const HealthLog = require('../models/HealthLog');
const { generateChatResponse } = require('../services/aiService');

// @desc    Analyze user question and return context-aware AI or deterministic response
// @route   POST /api/ai/chat
// @access  Private
const getAIChatResponse = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question) {
    res.status(400);
    throw new Error('Question is required');
  }

  // 1. Fetch user's medicines
  const medicines = await Medicine.find({ userId: req.user });

  // 2. Fetch user's health logs
  const healthLogs = await HealthLog.find({ userId: req.user }).sort({ date: -1 });

  // 3. Process query using Hybrid Routing
  const responseText = await generateChatResponse(question, medicines, healthLogs, req.user);

  res.json({ response: responseText });
});

module.exports = {
  getAIChatResponse,
};
