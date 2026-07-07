const express = require('express');
const { getAIChatResponse } = require('../controllers/aiController');
const { protect } = require('../utils/jwt');

const router = express.Router();

// All AI agent queries are protected under user session
router.use(protect);

router.post('/chat', getAIChatResponse);

module.exports = router;
