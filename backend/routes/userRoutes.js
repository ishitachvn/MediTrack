// routes/userRoutes.js
const express = require('express');
const { protect } = require('../utils/jwt');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController');

const router = express.Router();

// Protect all user routes
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
