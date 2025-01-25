require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const auth = require('./middlewares/auth');

// Import route files
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const principalRoutes = require('./routes/principal');

// Initialize Express application
const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Route Mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/principal', principalRoutes);

// 4. Error Handling Middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development error handling
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  } 
  // Production error handling
  else {
    // Operational errors
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } 
    // Unknown errors
    else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
});

// 5. Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION 💥', err.name, err.message);
  server.close(() => process.exit(1));
});

module.exports = app;