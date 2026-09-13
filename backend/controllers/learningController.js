const Level = require('../models/Learning/Level');
const Challenge = require('../models/Learning/Challenge');
const UserProgress = require('../models/UserProgress');
const gamificationController = require('./gamificationController');
const mongoose = require('mongoose');

// Get all levels (with optional filtering)
exports.getLevels = async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        let query = {};
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        const levels = await Level.find(query).sort({ levelNumber: 1 });
        res.json(levels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all challenges (flattened from levels for simplified frontend consumption)
exports.getAllChallenges = async (req, res) => {
    try {
        const levels = await Level.find({}).populate('challenges');
        let allChallenges = [];

        levels.forEach(level => {
            if (level.challenges && level.challenges.length > 0) {
                level.challenges.forEach(challenge => {
                    if (!challenge) return;
                    // Convert to plain object to attach extra properties
                    let challengeObj = challenge.toObject();

                    // Attach level-specific info to the challenge
                    challengeObj.category = level.category;
                    challengeObj.levelId = level._id;
                    challengeObj.levelDifficulty = level.difficulty; // Level difficulty might differ from challenge difficulty

                    // Default fields if missing (for frontend compatibility)
                    if (!challengeObj.isLocked) challengeObj.isLocked = false;
                    if (!challengeObj.isCompleted) challengeObj.isCompleted = false;

                    allChallenges.push(challengeObj);
                });
            }
        });

        res.json(allChallenges);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get specific level details with challenges
exports.getLevelDetails = async (req, res) => {
    try {
        const levelId = req.params.id;
        const level = await Level.findById(levelId).populate('challenges');
        if (!level) return res.status(404).json({ message: 'Level not found' });
        res.json(level);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a specific challenge
exports.getChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
        res.json(challenge);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get the next challenge in the path sequence
exports.getNextChallenge = async (req, res) => {
    try {
        const challengeId = req.params.id;
        const challIdObj = new mongoose.Types.ObjectId(challengeId);
        
        // Find the level containing this challenge
        const currentLevel = await Level.findOne({ challenges: challIdObj });
        if (!currentLevel) {
            console.error(`Level not found for challenge ID: ${challengeId}`);
            return res.status(404).json({ message: 'Level not found for this challenge' });
        }

        const challengesArray = currentLevel.challenges.map(id => id.toString());
        const currentIndex = challengesArray.indexOf(challengeId);

        let nextChallengeId = null;

        if (currentIndex < challengesArray.length - 1) {
            // Next challenge in the same level
            nextChallengeId = challengesArray[currentIndex + 1];
        } else {
            // Find next level in the same category
            const nextLevel = await Level.findOne({ 
                category: currentLevel.category, 
                levelNumber: currentLevel.levelNumber + 1 
            });
            if (nextLevel && nextLevel.challenges.length > 0) {
                nextChallengeId = nextLevel.challenges[0].toString();
            }
        }

        res.json({ nextChallengeId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Submit a challenge solution
exports.submitChallenge = async (req, res) => {
    try {
        const { challengeId, code, passed } = req.body;
        const userId = req.user.id;

        if (!passed) {
            return res.json({ success: false, message: 'Challenge not passed yet.' });
        }

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

        let progress = await UserProgress.findOne({ user: userId });
        if (!progress) {
            progress = await UserProgress.create({ user: userId });
        }

        // Check if already completed
        const alreadyCompleted = progress.completedChallenges.find(
            c => c.challenge.toString() === challengeId
        );

        if (!alreadyCompleted) {
            progress.completedChallenges.push({
                challenge: challengeId,
                score: challenge.xpReward // simplified score == xp
            });
            await progress.save();

            // Award XP
            await gamificationController.awardXp(userId, challenge.xpReward);
        }

        res.json({ success: true, message: 'Challenge completed!', xpEarned: challenge.xpReward });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get the logged-in user's learning progress
exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const progress = await UserProgress.findOne({ user: userId })
            .populate('completedChallenges.challenge');
        
        if (!progress) {
            return res.json({
                totalXp: 0,
                completedChallenges: [],
                unlockedBadges: [],
                level: 1
            });
        }
        res.json(progress);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Get all unique categories and their available difficulty levels
exports.getCategories = async (req, res) => {
    try {
        const categories = await Level.aggregate([
            {
                $group: {
                    _id: "$category",
                    difficulties: { $addToSet: "$difficulty" },
                    totalLevels: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    difficulties: 1,
                    totalLevels: 1
                }
            },
            { $sort: { category: 1 } }
        ]);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
