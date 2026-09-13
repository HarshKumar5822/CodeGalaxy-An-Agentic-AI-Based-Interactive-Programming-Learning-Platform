const Progress = require('../models/Progress');

// @desc    Get user progress
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ user: req.user._id }).populate('challenge', 'title difficulty');
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update progress (e.g. mark as completed)
// @route   POST /api/progress
// @access  Private
const updateProgress = async (req, res) => {
    const { challengeId, status, code } = req.body;

    try {
        let progress = await Progress.findOne({ user: req.user._id, challenge: challengeId });

        if (progress) {
            progress.status = status;
            progress.code = code || progress.code;
            if (status === 'Completed') {
                progress.completedAt = Date.now();
            }
            await progress.save();
        } else {
            progress = await Progress.create({
                user: req.user._id,
                challenge: challengeId,
                status,
                code,
                completedAt: status === 'Completed' ? Date.now() : undefined
            });
        }

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getProgress, updateProgress };
