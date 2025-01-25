const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const teacherController = require('../controllers/teacherController');

// Apply authentication middleware to all teacher routes
router.use(auth.protect);
router.use(auth.checkRole('teacher'));

// GET /teacher/assignments - List assignments submitted to teacher
router.get('/assignments', teacherController.listAssignments);

// POST /teacher/assignments - Create new assignment for students (if allowed)
router.post('/assignments', teacherController.createStudentAssignment);

// POST /teacher/assignments/grade - Grade a submitted assignment
router.post('/assignments/grade', teacherController.gradeAssignment);

module.exports = router;