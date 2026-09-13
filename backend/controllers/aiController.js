const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const LearningPath = require('../models/LearningPath');
const SkillNode = require('../models/SkillNode');
const Challenge = require('../models/Challenge');
const geminiService = require('../services/geminiService');
const qdrantService = require('../services/qdrantService');

// @desc    Submit Pre-Assessment & Init Profile
// @route   POST /api/learning/assess/pre
// @access  Private
const submitPreAssessment = asyncHandler(async (req, res) => {
    const { results } = req.body; // { result: [{ questionId, answer, isCorrect }] }

    // 1. Get AI Analysis of skills
    const skillProfile = await geminiService.generateSkillProfile(results);

    if (!skillProfile) {
        res.status(500);
        throw new Error('AI Analysis Failed');
    }

    // 2. Update User Profile
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Map AI response to User schema
    // Assuming skillProfile.skillMap is { "React": { "level": "Intermediate", ... } }
    if (skillProfile.skillMap) {
        for (const [skill, data] of Object.entries(skillProfile.skillMap)) {
            user.skillLevels.set(skill, {
                level: data.level,
                score: data.confidence || 50,
                confidence: data.confidence || 50
            });
        }
    }

    user.preferences.pace = skillProfile.recommendedPace || 'Medium';
    await user.save();

    res.json({
        message: 'Assessment Analyzed',
        profile: user.skillLevels,
        pace: user.preferences.pace
    });
});

// @desc    Generate Learning Path
// @route   POST /api/learning/path/generate
// @access  Private
const generatePath = asyncHandler(async (req, res) => {
    const { goal } = req.body;
    const user = await User.findById(req.user._id);

    // 1. Generate Path Structure via AI
    const aiPath = await geminiService.generateLearningPath(user.skillLevels, goal || user.preferences.goal);

    if (!aiPath || !aiPath.nodes) {
        res.status(500);
        throw new Error('Path Generation Failed');
    }

    // 2. Create/Find SkillNodes in DB
    const nodeIds = [];
    for (const node of aiPath.nodes) {
        let skillNode = await SkillNode.findOne({ name: node.title });
        if (!skillNode) {
            skillNode = await SkillNode.create({
                name: node.title,
                category: node.category,
                difficulty: node.difficulty,
                metadata: { estimatedTimeMinutes: node.estimatedTime }
            });
        }
        // Create embedding for the node description/title and upsert to Qdrant
        // This is a simplified version; normally you'd generate a vector here.
        // await qdrantService.upsertContent(skillNode._id.toString(), generatedVector, { ...node });

        nodeIds.push({
            skillNode: skillNode._id,
            status: nodeIds.length === 0 ? 'Unlocked' : 'Locked' // Unlock first item
        });
    }

    // 3. Save Learning Path
    const learningPath = await LearningPath.create({
        user: user._id,
        nodes: nodeIds,
        status: 'Active'
    });

    user.currentPath = learningPath._id;
    await user.save();

    res.json(learningPath);
});

// @desc    Get Current Path
// @route   GET /api/learning/path/current
// @access  Private
const getCurrentPath = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user.currentPath) {
        res.status(404);
        throw new Error('No active path found');
    }

    const path = await LearningPath.findById(user.currentPath)
        .populate('nodes.skillNode');

    res.json(path);
});

// @desc    Submit Module Quiz & Adapt
// @route   POST /api/learning/quiz/submit
// @access  Private
const submitQuiz = asyncHandler(async (req, res) => {
    const { pathId, nodeId, score, passed } = req.body;

    const path = await LearningPath.findById(pathId);
    if (!path) {
        res.status(404);
        throw new Error('Path not found');
    }

    // Find the node in the path
    const nodeIndex = path.nodes.findIndex(n => n.skillNode.toString() === nodeId);
    if (nodeIndex === -1) {
        res.status(404);
        throw new Error('Node not found in path');
    }

    // Update status
    path.nodes[nodeIndex].score = score;
    path.nodes[nodeIndex].status = passed ? 'Completed' : 'States'; // Keep as unlocked or failed?

    if (passed) {
        path.nodes[nodeIndex].completedAt = new Date();
        // Unlock next node
        if (nodeIndex + 1 < path.nodes.length) {
            path.nodes[nodeIndex + 1].status = 'Unlocked';
        }
    } else {
        // FAILED: Trigger Adaptation
        // 1. Get Remedial Content
        const skillNode = await SkillNode.findById(nodeId);
        const remedial = await geminiService.getRemedialSuggestion(skillNode.name);

        if (remedial) {
            // OPTION: Insert a new remedial node before the next one
            let remedialNode = await SkillNode.findOne({ name: remedial.remedialTopic });
            if (!remedialNode) {
                remedialNode = await SkillNode.create({
                    name: remedial.remedialTopic,
                    category: skillNode.category,
                    difficulty: 'Beginner', // Lower difficulty
                    description: remedial.explanation,
                    metadata: { userCreated: true }
                });
            }

            // Insert into path after current node
            path.nodes.splice(nodeIndex + 1, 0, {
                skillNode: remedialNode._id,
                status: 'Unlocked' // Unlock immediately
            });

            path.adaptiveLog.push({
                action: 'Added Remedial Node',
                reason: `Failed ${skillNode.name}`
            });
        }
    }

    await path.save();
    res.json({ success: true, path });
});

const chatWithAI = asyncHandler(async (req, res) => {
    const { message, history, pageContext } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    // Stream the reply as plain text chunks (chunked transfer encoding) so the frontend can
    // render text as it's generated instead of waiting for the whole reply. This is what makes
    // slow local models (Ollama on CPU) feel responsive instead of "stuck for 5 minutes".
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no'); // disable proxy buffering (nginx etc.)

    try {
        await geminiService.generateChatReplyStream(message, history, pageContext, (chunk) => {
            res.write(chunk);
        });
        res.end();
    } catch (error) {
        console.error('Chat stream error:', error.message || error);
        if (!res.headersSent) {
            res.status(500);
        }
        res.end(`\n[Error: ${error.message || 'AI generation failed'}]`);
    }
});

// @desc    Create a challenge dynamically using AI
// @route   POST /api/ai/forge/generate
// @access  Private
const createForgeChallenge = asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400);
        throw new Error('Prompt is required');
    }

    const generated = await geminiService.generateCustomChallenge(prompt);
    if (!generated) {
        res.status(500);
        throw new Error('Could not generate challenge using the AI agent');
    }

    const challenge = new Challenge({
        title: generated.title,
        description: generated.description,
        difficulty: generated.difficulty || 'Easy',
        category: 'Nebula Forge',
        type: 'Algorithm',
        xpReward: generated.xpReward || 100,
        instructions: generated.instructions || '',
        testCases: generated.testCases || [],
        template: generated.template || ''
    });

    const savedChallenge = await challenge.save();
    res.status(201).json(savedChallenge);
});

// @desc    Analyze active code in challenge editor
// @route   POST /api/ai/copilot/analyze
// @access  Private
const analyzeActiveCode = asyncHandler(async (req, res) => {
    const { code, language, challengeTitle, challengeDescription } = req.body;
    if (!code || !language) {
        res.status(400);
        throw new Error('Code and language are required');
    }

    const analysis = await geminiService.analyzeCodeFeedback(
        code, 
        language, 
        challengeTitle || 'General Code Workspace', 
        challengeDescription || ''
    );

    if (!analysis) {
        res.status(500);
        throw new Error('AI analysis failed');
    }

    res.json(analysis);
});

// @desc    Debug and diagnose compile/runtime error
// @route   POST /api/ai/repair/diagnose
// @access  Private
const repairActiveCode = asyncHandler(async (req, res) => {
    const { code, language, errorMsg, testCases } = req.body;
    if (!code || !language) {
        res.status(400);
        throw new Error('Code and language are required');
    }

    const diagnosis = await geminiService.debugCodeError(
        code, 
        language, 
        errorMsg || 'Unknown execution error', 
        testCases || []
    );

    if (!diagnosis) {
        res.status(500);
        throw new Error('AI debugging failed');
    }

    res.json(diagnosis);
});

module.exports = {
    submitPreAssessment,
    generatePath,
    getCurrentPath,
    submitQuiz,
    chatWithAI,
    createForgeChallenge,
    analyzeActiveCode,
    repairActiveCode
};

