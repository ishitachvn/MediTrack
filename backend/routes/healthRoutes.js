// routes/healthRoutes.js
const express = require('express');
const { protect } = require('../utils/jwt');
const {
  addHealthLog,
  getHealthLogs,
  updateHealthLog,
} = require('../controllers/healthController');

const router = express.Router();

// All health routes require authentication
router.use(protect);

router.post('/', addHealthLog);          // POST /api/health
router.get('/', getHealthLogs);          // GET  /api/health
router.put('/:id', updateHealthLog);     // PUT  /api/health/:id

module.exports = router;
