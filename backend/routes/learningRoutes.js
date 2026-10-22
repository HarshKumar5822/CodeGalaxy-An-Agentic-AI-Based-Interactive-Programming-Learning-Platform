const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Public curriculum routes
router.get('/challenges', learningController.getAllChallenges);
router.get('/levels', learningController.getLevels);
router.get('/categories', learningController.getCategories);
router.get('/levels/:id', learningController.getLevelDetails);
router.get('/challenges/:id', learningController.getChallenge);
router.get('/challenges/:id/next', learningController.getNextChallenge);

// User-specific routes
router.get('/progress', optionalProtect, learningController.getUserProgress);
router.post('/submit', protect, learningController.submitChallenge);

module.exports = router;

