// utils/jwt.js
const jwt = require('jsonwebtoken');

// Generates a JWT token that expires in 30 days
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Middleware to protect routes – verifies token and attaches user id to request
const protect = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; // attach user id
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
};

module.exports = { generateToken, protect };
