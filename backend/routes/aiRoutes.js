const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// AI Chatbot Route (accessible for real-time AI responses)
router.post('/chat', aiController.chatWithAI);

// AI Learning Adaptation Routes
router.post('/assess/pre', authMiddleware.protect, aiController.submitPreAssessment);
router.post('/path/generate', authMiddleware.protect, aiController.generatePath);
router.get('/path/current', authMiddleware.protect, aiController.getCurrentPath);
router.post('/quiz/submit', authMiddleware.protect, aiController.submitQuiz);

// Agentic AI routes
router.post('/forge/generate', authMiddleware.protect, aiController.createForgeChallenge);
router.post('/copilot/analyze', authMiddleware.protect, aiController.analyzeActiveCode);
router.post('/repair/diagnose', authMiddleware.protect, aiController.repairActiveCode);

module.exports = router;
