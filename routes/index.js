const express = require('express');
const router = express.Router();

// Import individual route files
const studentRoutes = require('./student');
const teacherRoutes = require('./teacher');
const principalRoutes = require('./principal');

// Define main API endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'Assignment Management System API',
    endpoints: {
      student: '/student',
      teacher: '/teacher',
      principal: '/principal'
    }
  });
});

// Mount individual route files
router.use('/student', studentRoutes);
router.use('/teacher', teacherRoutes);
router.use('/principal', principalRoutes);

module.exports = router;