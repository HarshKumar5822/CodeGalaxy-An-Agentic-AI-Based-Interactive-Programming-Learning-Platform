const asyncHandler = require('express-async-handler');
const InterviewPrep = require('../models/InterviewPrep');
const User = require('../models/User');
const geminiService = require('../services/geminiService');
const { runCode: executeCodeLocal } = require('../utils/executeCode');

// @desc    Get current interview prep state
// @route   GET /api/interview-prep/state
// @access  Private
const getInterviewPrepState = asyncHandler(async (req, res) => {
    let state = await InterviewPrep.findOne({ user: req.user._id });
    
    if (!state) {
        state = await InterviewPrep.create({
            user: req.user._id,
            selectedLanguage: 'Python',
            skillLevel: 'Beginner'
        });
    }

    res.json(state);
});

// @desc    Save language and level configuration
// @route   POST /api/interview-prep/config
// @access  Private
const updateInterviewPrepConfig = asyncHandler(async (req, res) => {
    const { language, skillLevel } = req.body;

    if (!language || !skillLevel) {
        res.status(400);
        throw new Error('Language and skillLevel are required');
    }

    let state = await InterviewPrep.findOne({ user: req.user._id });
    if (!state) {
        state = new InterviewPrep({ user: req.user._id });
    }

    state.selectedLanguage = language;
    state.skillLevel = skillLevel;
    await state.save();

    res.json(state);
});

// @desc    Generate quiz dynamically using Gemini
// @route   POST /api/interview-prep/quiz/generate
// @access  Private
const generateQuiz = asyncHandler(async (req, res) => {
    const state = await InterviewPrep.findOne({ user: req.user._id });
    const language = state ? state.selectedLanguage : 'Python';
    const level = state ? state.skillLevel : 'Beginner';
    const weakTopics = state ? state.weakTopics : [];

    const quiz = await geminiService.generateInterviewQuiz(language, level, weakTopics);
    
    if (!quiz) {
        res.status(500);
        throw new Error('Failed to generate quiz');
    }

    res.json(quiz);
});

// @desc    Submit quiz results and update memory profile
// @route   POST /api/interview-prep/quiz/submit
// @access  Private
const submitQuiz = asyncHandler(async (req, res) => {
    const { score, totalQuestions, strongTopics, weakTopics } = req.body;

    let state = await InterviewPrep.findOne({ user: req.user._id });
    if (!state) {
        state = await InterviewPrep.create({ user: req.user._id });
    }

    // Append quiz history
    state.quizzes.push({
        language: state.selectedLanguage,
        skillLevel: state.skillLevel,
        score,
        totalQuestions,
        strongTopics: strongTopics || [],
        weakTopics: weakTopics || []
    });

    // Update overall memory profile strong/weak areas
    if (strongTopics && Array.isArray(strongTopics)) {
        strongTopics.forEach(t => {
            if (!state.strongTopics.includes(t)) state.strongTopics.push(t);
            // Remove from weak if it's now strong
            state.weakTopics = state.weakTopics.filter(wt => wt !== t);
        });
    }

    if (weakTopics && Array.isArray(weakTopics)) {
        weakTopics.forEach(t => {
            if (!state.weakTopics.includes(t) && !state.strongTopics.includes(t)) {
                state.weakTopics.push(t);
            }
        });
    }

    await state.save();
    res.json({ success: true, state });
});

// @desc    Generate coding problem dynamically using Gemini
// @route   POST /api/interview-prep/coding/generate
// @access  Private
const generateCodingProblem = asyncHandler(async (req, res) => {
    const state = await InterviewPrep.findOne({ user: req.user._id });
    const language = state ? state.selectedLanguage : 'Python';
    const level = state ? state.skillLevel : 'Beginner';
    const weakTopics = state ? state.weakTopics : [];

    const problem = await geminiService.generateInterviewCoding(language, level, weakTopics);

    if (!problem) {
        res.status(500);
        throw new Error('Failed to generate coding problem');
    }

    res.json(problem);
});

// @desc    Execute code locally and review using Gemini Co-Pilot
// @route   POST /api/interview-prep/coding/evaluate
// @access  Private
const evaluateCodingSolution = asyncHandler(async (req, res) => {
    const { code, problemTitle, problemDescription, testCases } = req.body;
    let state = await InterviewPrep.findOne({ user: req.user._id });
    const language = state ? state.selectedLanguage : 'Python';

    if (!code) {
        res.status(400);
        throw new Error('Code is required');
    }

    // Determine execution capability
    const langLower = language.toLowerCase();
    const compilable = ['js', 'javascript', 'python', 'py', 'c', 'cpp', 'java'].includes(langLower);
    
    let runResult = { output: "Visual execution skipped for this language. Code analyzed directly.", success: true, time: 0 };
    
    try {
        if (compilable) {
            // Run locally against first testcase if available
            const testInput = testCases?.[0]?.input || "";
            let normalizedLanguage = langLower;
            if (normalizedLanguage === 'javascript') normalizedLanguage = 'js';
            if (normalizedLanguage === 'python') normalizedLanguage = 'py';
            
            runResult = await executeCodeLocal(normalizedLanguage, code, testInput);
        }
    } catch (err) {
        runResult = { output: err.message || "Execution exception", success: false, time: 0 };
    }

    // Call Gemini for review
    const review = await geminiService.evaluateInterviewCode(
        code, 
        language, 
        problemTitle || 'Challenge Workspace', 
        problemDescription || '', 
        runResult
    );

    if (!review) {
        res.status(500);
        throw new Error('Evaluation failed');
    }

    // Update memory profile solved history
    if (state) {
        state.solvedProblems.push({
            language,
            problemTitle: problemTitle || 'AI Coding Challenge',
            difficulty: state.skillLevel,
            isSolved: review.passed,
            timeComplexity: review.timeComplexity,
            spaceComplexity: review.spaceComplexity
        });

        // Add topic details into strong/weak arrays
        const categoryKeyword = problemTitle || 'Coding';
        if (review.passed) {
            state.weakTopics = state.weakTopics.filter(t => t !== categoryKeyword);
            if (!state.strongTopics.includes(categoryKeyword)) {
                state.strongTopics.push(categoryKeyword);
            }
        } else {
            if (!state.weakTopics.includes(categoryKeyword) && !state.strongTopics.includes(categoryKeyword)) {
                state.weakTopics.push(categoryKeyword);
            }
        }

        await state.save();
    }

    res.json({
        runOutput: runResult.output,
        runSuccess: runResult.success,
        ...review
    });
});

// @desc    Process simulated interview answer and ask next question
// @route   POST /api/interview-prep/interview/answer
// @access  Private
const answerInterviewQuestion = asyncHandler(async (req, res) => {
    const { chatHistory } = req.body;

    if (!chatHistory || !Array.isArray(chatHistory)) {
        res.status(400);
        throw new Error('chatHistory array is required');
    }

    let state = await InterviewPrep.findOne({ user: req.user._id });
    const language = state ? state.selectedLanguage : 'Python';
    const level = state ? state.skillLevel : 'Beginner';

    const countUserReplies = chatHistory.filter(m => m.sender === 'user').length;

    if (countUserReplies >= 5) {
        // Evaluate complete interview
        const evaluation = await geminiService.evaluateSimulatedInterview(chatHistory, language, level);
        
        if (state) {
            state.interviews.push({
                language,
                score: evaluation.score,
                rating: evaluation.rating,
                weakAreas: evaluation.weakAreas || [],
                roadmap: evaluation.roadmap || []
            });

            // Update weak areas memory
            if (evaluation.weakAreas) {
                evaluation.weakAreas.forEach(area => {
                    if (!state.weakTopics.includes(area) && !state.strongTopics.includes(area)) {
                        state.weakTopics.push(area);
                    }
                });
            }
            await state.save();
        }

        res.json({
            isCompleted: true,
            evaluation
        });
    } else {
        // Ask next question
        const response = await geminiService.generateInterviewQuestion(language, level, chatHistory);
        res.json({
            isCompleted: false,
            ...response
        });
    }
});

module.exports = {
    getInterviewPrepState,
    updateInterviewPrepConfig,
    generateQuiz,
    submitQuiz,
    generateCodingProblem,
    evaluateCodingSolution,
    answerInterviewQuestion
};
