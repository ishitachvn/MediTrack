require('dotenv').config();
require('express-async-errors'); // to handle async errors without try-catch
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const healthRoutes = require('./routes/healthRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://medi-track-six-zeta.vercel.app"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Connect to DB
connectDB();

// API routes with startup logs
console.log('Registering routes...');
console.log(' - Auth routes loaded');
app.use('/api/auth', authRoutes);
console.log(' - User routes loaded');
app.use('/api/users', userRoutes);
console.log(' - Medicine routes loaded');
app.use('/api/medicines', medicineRoutes);
console.log(' - Health routes loaded');
app.use('/api/health', healthRoutes);
console.log(' - AI routes loaded');
app.use('/api/ai', aiRoutes);

// Temporary diagnostics endpoint
app.get('/api/env-check', (req, res) => {
  res.json({
    keys: Object.keys(process.env),
    geminiKeyExists: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
  });
});

// 404 handler for undefined routes
app.use(notFound);
// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
