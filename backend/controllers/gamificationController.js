const Badge = require('../models/Gamification/Badge');
const UserProgress = require('../models/UserProgress');

const User = require('../models/User');

// Get user's progress including badges and XP
exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.user ? (req.user._id || req.user.id) : null;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Find User Progress
        let progress = await UserProgress.findOne({ user: userId })
            .populate('unlockedBadges.badge')
            .populate('completedChallenges.challenge');

        if (!progress) {
            // Create initial progress if not exists
            progress = await UserProgress.create({ user: userId, totalXp: 150, currentStreak: 1, level: 1 });
        }

        // Find User for Skill Levels
        const user = await User.findById(userId).select('skillLevels streak name email');

        // Find all Badges to compare earned vs unearned for the frontend
        const allBadges = await Badge.find({});
        const unlockedBadges = progress.unlockedBadges || [];

        const mappedBadges = allBadges.map(b => {
            const isEarned = unlockedBadges.some(ub => ub && ub.badge && ub.badge._id && ub.badge._id.toString() === b._id.toString());
            return {
                id: b._id,
                name: b.name,
                description: b.description,
                icon: b.iconUrl || 'award', // fallback icon
                isEarned
            };
        });

        let skillLevelsObj = { logic: 80, syntax: 65, algorithms: 90, debugging: 45, cleanCode: 70 };
        if (user && user.skillLevels) {
            try {
                if (typeof user.skillLevels.entries === 'function') {
                    skillLevelsObj = Object.fromEntries(user.skillLevels);
                } else if (typeof user.skillLevels === 'object') {
                    skillLevelsObj = { ...skillLevelsObj, ...user.skillLevels };
                }
            } catch (e) {
                console.error("Error parsing skillLevels:", e);
            }
        }

        const dashboardData = {
            id: user ? user._id : userId,
            name: user ? user.name : 'Explorer',
            totalXP: progress.totalXp || 150,
            level: progress.level || 1,
            currentXP: (progress.totalXp || 150) % 100,
            xpToNextLevel: 100,
            streak: (user && user.streak) || progress.currentStreak || 1,
            completedChallenges: progress.completedChallenges || [],
            badges: mappedBadges,
            skillLevels: skillLevelsObj
        };

        res.json(dashboardData);
    } catch (err) {
        console.error("Error in getUserProgress:", err);
        res.status(500).json({ message: err.message });
    }
};

// Get all available badges
exports.getAllBadges = async (req, res) => {
    try {
        const badges = await Badge.find({});
        res.json(badges);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Internal helper to award XP and check for badges
exports.awardXp = async (userId, amount) => {
    let progress = await UserProgress.findOne({ user: userId });
    if (!progress) {
        progress = await UserProgress.create({ user: userId });
    }

    progress.totalXp += amount;

    // Simple level up logic: Level = sqrt(XP) * constant or similar. 
    // For now: Level = floor(totalXp / 100) + 1
    const newLevel = Math.floor(progress.totalXp / 100) + 1;
    if (newLevel > progress.level) {
        progress.level = newLevel;
        // Could add notification logic here
    }

    await progress.save();
    return progress;
};

// Get leaderboard rankings
exports.getLeaderboard = async (req, res) => {
    try {
        const allProgress = await UserProgress.find({})
            .populate('user', 'name')
            .sort({ totalXp: -1 })
            .limit(100);

        const leaderboard = allProgress.map((p, index) => ({
            rank: index + 1,
            username: p.user ? p.user.name : 'Unknown Navigator',
            level: p.level || 1,
            xp: p.totalXp || 0,
            streak: p.currentStreak || 0,
            badges: p.unlockedBadges ? p.unlockedBadges.length : 0,
            userId: p.user ? p.user._id : null
        }));

        const currentUserId = req.user.id;
        const fullRanking = await UserProgress.find({}).sort({ totalXp: -1 });
        const userRankIndex = fullRanking.findIndex(p => p.user && p.user.toString() === currentUserId.toString());
        const userRank = userRankIndex !== -1 ? userRankIndex + 1 : fullRanking.length + 1;

        const userProgress = await UserProgress.findOne({ user: currentUserId });
        const userXp = userProgress ? userProgress.totalXp : 0;

        res.json({
            leaderboard,
            userRank,
            userXp
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
