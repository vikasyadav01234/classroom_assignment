const express = require('express');
const router = express.Router();
const {
  listAssignments,
  createAssignment,
  editAssignment,
  submitAssignment
} = require('../controllers/studentController');
const { protect, checkRole } = require('../middlewares/auth');

// Protect all student routes
router.use(protect, checkRole('student'));

router.get('/assignments', listAssignments);
router.post('/assignments', createAssignment);
router.put('/assignments', editAssignment);
router.post('/assignments/submit', submitAssignment);

module.exports = router;