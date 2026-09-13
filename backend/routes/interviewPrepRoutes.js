const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getInterviewPrepState,
    updateInterviewPrepConfig,
    generateQuiz,
    submitQuiz,
    generateCodingProblem,
    evaluateCodingSolution,
    answerInterviewQuestion
} = require('../controllers/interviewPrepController');

// All routes are protected with JWT auth
router.use(authMiddleware.protect);

router.get('/state', getInterviewPrepState);
router.post('/config', updateInterviewPrepConfig);
router.post('/quiz/generate', generateQuiz);
router.post('/quiz/submit', submitQuiz);
router.post('/coding/generate', generateCodingProblem);
router.post('/coding/evaluate', evaluateCodingSolution);
router.post('/interview/answer', answerInterviewQuestion);

module.exports = router;
