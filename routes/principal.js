const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middlewares/auth');
const { listTeachers, listAllAssignments, regradeAssignment } = require('../controllers/principalController');
const auth = require('../middlewares/auth');



router.use(protect, checkRole('principal'));
router.get('/assignments', listAllAssignments);
router.post('/assignments/grade', regradeAssignment);
router.get('/teachers', listTeachers);

module.exports = router;