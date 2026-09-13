const express = require('express');
const router = express.Router();
const { registerUser, authUser, getMe, socialAuthUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', authUser);
router.post('/social', socialAuthUser);
router.get('/me', protect, getMe);

module.exports = router;
