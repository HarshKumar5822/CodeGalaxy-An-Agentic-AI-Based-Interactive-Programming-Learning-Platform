const Challenge = require('../models/Challenge');
const { runCode: executeCodeLocal } = require('../utils/executeCode');

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Public
const getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find({});
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single challenge
// @route   GET /api/challenges/:id
// @access  Public
const getChallenge = async (req, res) => {
    try {
        let challenge;
        const id = req.params.id;

        // Check if ID is a valid MongoDB ObjectId (24 hex chars)
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            challenge = await Challenge.findById(id);
        }

        // If not found by ID (or not an ID), try searching by title (slug-like)
        if (!challenge) {
            // Replace hyphens with spaces for a loose title match
            // Escape any special regex characters in the ID
            const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const titleSearch = escapedId.replace(/-/g, '[\\s-]');
            
            challenge = await Challenge.findOne({ 
                title: { $regex: new RegExp(`^${titleSearch}$`, 'i') } 
            });
        }

        if (challenge) {
            res.json(challenge);
        } else {
            res.status(404).json({ message: 'Challenge not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a challenge
// @route   POST /api/challenges
// @access  Private/Admin
const createChallenge = async (req, res) => {
    const { title, description, difficulty, testCases, template } = req.body;

    try {
        const challenge = new Challenge({
            title,
            description,
            difficulty,
            testCases,
            template
        });

        const createdChallenge = await challenge.save();
        res.status(201).json(createdChallenge);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Run code (Local backend execution)
// @route   POST /api/challenges/run
// @access  Private
const runCode = async (req, res) => {
    let { code, language, expectedInput } = req.body;

    if (!code || !language) {
        return res.status(400).json({ message: 'Code and language are required' });
    }

    // Normalize language string
    const langLower = (language || '').toLowerCase();
    if (langLower === 'javascript' || langLower === 'js') language = 'js';
    else if (langLower === 'python' || langLower === 'py') language = 'py';
    else if (langLower === 'cpp' || langLower === 'c++') language = 'cpp';
    else if (langLower === 'java') language = 'java';

    try {
        const result = await executeCodeLocal(language, code, expectedInput);

        res.json({
            output: result.output,
            passed: result.success,
            time: result.time,
            memory: 0, // Memory tracking skipped for simple exec
            status: {
                id: result.success ? 3 : 11, // 3: Accepted, 11: Runtime Error
                description: result.success ? 'Accepted' : 'Runtime Error'
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Execution Error', error: err.message });
    }
};

module.exports = { getChallenges, getChallenge, createChallenge, runCode };
