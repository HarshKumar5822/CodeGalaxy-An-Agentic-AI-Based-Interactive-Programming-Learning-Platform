const mongoose = require('mongoose');

const progressSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    status: {
        type: String,
        enum: ['Completed', 'In Progress', 'Failed'],
        default: 'In Progress'
    },
    code: {
        type: String // User's submission
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
