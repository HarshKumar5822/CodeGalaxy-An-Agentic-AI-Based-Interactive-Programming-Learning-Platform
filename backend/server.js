const express = require('express'); // Trigger restart for 5005
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

const authRoutes = require('./routes/authRoutes');

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));
app.use('/api/gamification', require('./routes/gamificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/interview-prep', require('./routes/interviewPrepRoutes'));
app.use('/api/rag', require('./routes/ragRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Fire-and-forget: doesn't block server startup, just logs provider health to the console.
    require('./services/geminiService').checkAiProviders().catch(e => console.error('[AI] Diagnostic check crashed:', e.message));
});
