const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// AI Chatbot Route (accessible for real-time AI responses)
router.post('/chat', aiController.chatWithAI);

// AI Learning Adaptation Routes
router.post('/assess/pre', protect, aiController.submitPreAssessment);
router.post('/path/generate', protect, aiController.generatePath);
router.get('/path/current', protect, aiController.getCurrentPath);
router.post('/quiz/submit', protect, aiController.submitQuiz);

// Agentic AI routes (challenge generation, co-pilot analysis, debugging diagnostics)
router.post('/forge/generate', optionalProtect, aiController.createForgeChallenge);
router.post('/copilot/analyze', optionalProtect, aiController.analyzeActiveCode);
router.post('/repair/diagnose', optionalProtect, aiController.repairActiveCode);

module.exports = router;

