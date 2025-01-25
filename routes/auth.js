const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { login, register, logout} = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
//router.post('/logout', protect, logout);

module.exports = router;