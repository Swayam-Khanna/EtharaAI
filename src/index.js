const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(express.json()); // Parse JSON body

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Logging middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Throttling / Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Root Endpoint for checking API health
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Project Management API is healthy and running.'
  });
});

// Fallback Route for non-existent routes
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[Server] Express server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
