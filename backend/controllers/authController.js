const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const selectedRole = role === 'admin' ? 'admin' : 'student';
        const isAdminRole = selectedRole === 'admin';

        const user = await User.create({
            name,
            email,
            password,
            role: selectedRole,
            isAdmin: isAdminRole,
            streak: 1,
            lastLogin: new Date()
        });

        if (user) {
            await UserProgress.create({
                user: user._id,
                totalXp: 100,
                currentStreak: 1,
                level: 1
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Update role if explicitly selected during login
            if (role && (role === 'admin' || role === 'student')) {
                user.role = role;
                user.isAdmin = role === 'admin';
            }

            const now = new Date();
            let progress = await UserProgress.findOne({ user: user._id });
            if (!progress) {
                progress = await UserProgress.create({ user: user._id });
            }

            if (!user.lastLogin) {
                user.streak = 1;
                progress.currentStreak = 1;
                progress.totalXp = (progress.totalXp || 0) + 100; // First login bonus
            } else {
                const lastLoginDate = new Date(user.lastLogin);
                const isSameDay = now.toDateString() === lastLoginDate.toDateString();

                if (!isSameDay) {
                    const diffTime = Math.abs(now.getTime() - lastLoginDate.getTime());
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= 1) {
                        // Consecutive daily login
                        user.streak = (user.streak || 0) + 1;
                        progress.currentStreak = user.streak;
                        progress.totalXp = (progress.totalXp || 0) + 50; // Daily streak bonus
                    } else {
                        // Streak broken
                        user.streak = 1;
                        progress.currentStreak = 1;
                        progress.totalXp = (progress.totalXp || 0) + 20; // Standard login bonus
                    }
                }
            }

            user.lastLogin = now;
            progress.level = Math.floor((progress.totalXp || 0) / 1000) + 1;

            await user.save();
            await progress.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || (user.isAdmin ? 'admin' : 'student'),
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
                streak: user.streak,
                totalXp: progress.totalXp,
                level: progress.level
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile & stats
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (user) {
            // Fetch progress/gamification data to merge
            let progress = await UserProgress.findOne({ user: user._id })
                .populate('completedChallenges.challenge')
                .populate('unlockedBadges.badge');

            if (!progress) {
                progress = await UserProgress.create({ user: user._id });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || (user.isAdmin ? 'admin' : 'student'),
                isAdmin: user.isAdmin,
                totalXp: progress.totalXp,
                level: progress.level,
                currentStreak: user.streak || progress.currentStreak,
                completedChallenges: progress.completedChallenges,
                unlockedBadges: progress.unlockedBadges,
                skillLevels: user.skillLevels ? Object.fromEntries(user.skillLevels) : {}
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth or register via Social provider (GitHub/Google)
// @route   POST /api/auth/social
// @access  Public
const socialAuthUser = async (req, res) => {
    const { provider, role } = req.body;
    const selectedRole = role === 'admin' ? 'admin' : 'student';
    const providerName = provider === 'github' ? 'GitHub' : 'Google';
    const email = `${provider ? provider.toLowerCase() : 'social'}_user@codegalaxy.dev`;
    const name = `${providerName} Navigator`;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                password: `social_${Date.now()}_${Math.random()}`,
                role: selectedRole,
                isAdmin: selectedRole === 'admin',
                streak: 1,
                lastLogin: new Date()
            });

            await UserProgress.create({
                user: user._id,
                totalXp: 150,
                currentStreak: 1,
                level: 1
            });
        } else {
            if (role) {
                user.role = selectedRole;
                user.isAdmin = selectedRole === 'admin';
            }
            user.lastLogin = new Date();
            await user.save();
        }

        let progress = await UserProgress.findOne({ user: user._id });
        if (!progress) {
            progress = await UserProgress.create({ user: user._id, totalXp: 150, currentStreak: 1, level: 1 });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
            streak: user.streak || 1,
            totalXp: progress.totalXp || 150,
            level: progress.level || 1
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, authUser, getMe, socialAuthUser };
