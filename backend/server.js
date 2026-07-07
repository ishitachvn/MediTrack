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
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to DB
connectDB();

// API routes (prefix with /api)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler for undefined routes
app.use(notFound);
// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
