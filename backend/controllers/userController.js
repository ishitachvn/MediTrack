// controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get logged‑in user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

// @desc    Update user profile (name, email)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (name) user.name = name;
  if (email) user.email = email;
  await user.save();
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
