const mongoose = require('mongoose');

const interviewPrepSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  selectedLanguage: {
    type: String,
    default: 'Python'
  },
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  quizzes: [{
    language: String,
    skillLevel: String,
    score: Number,
    totalQuestions: Number,
    strongTopics: [String],
    weakTopics: [String],
    takenAt: {
      type: Date,
      default: Date.now
    }
  }],
  solvedProblems: [{
    language: String,
    problemTitle: String,
    difficulty: String,
    isSolved: Boolean,
    timeComplexity: String,
    spaceComplexity: String,
    takenAt: {
      type: Date,
      default: Date.now
    }
  }],
  interviews: [{
    language: String,
    score: Number,
    rating: String,
    weakAreas: [String],
    roadmap: [String],
    takenAt: {
      type: Date,
      default: Date.now
    }
  }],
  weakTopics: {
    type: [String],
    default: []
  },
  strongTopics: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('InterviewPrep', interviewPrepSchema);
