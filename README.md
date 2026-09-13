# 🌌 CodeGalaxy: An Agentic AI-Based Interactive Programming & Learning Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.2-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![AI-Powered](https://img.shields.io/badge/AI-Groq%20%7C%20Gemini%20%7C%20Ollama-orange.svg)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **CodeGalaxy** is an immersive, gamified, and AI-driven interactive programming platform designed to eliminate the abstract hurdles of learning computer science. By synthesizing **Agentic AI assistance**, **interactive algorithm visualizers**, **a solar-system gamified skill tree**, and **real-time multimodal RAG document analysis**, CodeGalaxy empowers learners to truly *see*, *interact with*, and *master* code logic.

---

## 🎯 Purpose & Vision

Programming is notoriously challenging for beginners because abstract concepts—such as memory pointers, recursion trees, sorting partitions, and multi-step algorithm logic—are invisible when studied solely through textbook definitions or static code blocks.

**CodeGalaxy** transforms abstract programming into an engaging, visual, and intelligent experience:
- **Visual Learning**: Instantaneous visual state feedback for data structures and algorithms.
- **Agentic AI Assistance**: Real-time code execution debugging, code repair, and dynamic challenge generation using state-of-the-art AI models.
- **Gamified Progression**: Learn coding like exploring a galaxy—unlock skill planets, earn XP rewards, maintain streaks, and receive certified pilot licenses.
- **Career Readiness**: Integrated AI technical interview prep with live coding evaluation, adaptive quizzes, and voice/chat interview simulators.

---

## 🌟 Key Features

### 1. 🪐 Gamified Solar System Skill Tree
- **Level Map & Planets**: Navigate through interactive planetary skill nodes (Variables, Loops, Data Structures, Algorithms).
- **Gamification Mechanics**: XP bars, daily streak counters, achievement badges, and customizable pilot licenses.
- **Adaptive Progression**: Unlocks subsequent nodes dynamically upon quiz and coding challenge completion.

### 2. 🤖 Agentic AI Copilot & Code Repair Engine
- **Real-Time Code Analysis**: Analyzes active code in the Monaco editor to provide hints, space/time complexity bounds, and logic feedback.
- **Automated Code Repair**: Diagnoses runtime and compilation errors, providing step-by-step fix explanations without revealing spoilers outright.
- **Multi-Provider AI Core**: Seamlessly routes requests across **Groq** (ultra-fast LPU inference), **Google Gemini**, and local **Ollama** models.

### 3. ⚔️ Nebula Forge (Dynamic AI Challenge Generator)
- Generates custom coding challenges on demand from plain text prompts.
- Automatically creates test cases, problem instructions, difficulty ratings, XP rewards, and starter boilerplate code in JavaScript, Python, or Java.

### 4. 🎤 AI Technical Interview Simulator
- **Adaptive Technical Quizzes**: Evaluates candidate skill levels and dynamically adapts question difficulty.
- **Interview Simulator**: Realistic mock interview rounds with real-time text/speech feedback.
- **Live Coding Round Evaluator**: Scores candidates on problem-solving approach, code efficiency, and edge-case coverage.

### 5. 📊 Interactive Algorithm & Data Structure Visualizer
- **Sorting Visualizer**: Step-by-step animated execution of Bubble Sort, Quick Sort, Merge Sort, and Selection Sort.
- **Data Structure Visualizers**: Animated pointer movements and node manipulation for LinkedLists and Binary Search Trees.
- **Interactive Controls**: Adjust execution speed, step forwards/backwards, and modify input arrays live.

### 6. 📑 Multimodal RAG Document & Image Analyzer
- **Document Q&A**: Ingest PDFs and text files with TF-IDF cosine-similarity retrieval chunking.
- **Multimodal Image Q&A**: Upload code screenshots, architectural diagrams, or handwritten notes for vision model analysis.

---

## 📐 Data Flow Diagram (DFD)

```
                       +-----------------------------------+
                       |           User / Student          |
                       +-----------------------------------+
                                         |
                                         v
                       +-----------------------------------+
                       |         React 18 + Vite           |
                       |    Frontend (Monaco / Recharts)   |
                       +-----------------------------------+
                                   |           |
             HTTP / REST (JWT Auth) |           | Streaming SSE Chat
                                   v           v
                       +-----------------------------------+
                       |       Node.js + Express 5         |
                       |          Backend Server           |
                       +-----------------------------------+
                         /         |              \       \
                        /          |               \       \
                       v           v                v       v
         +------------------+ +-----------+ +------------+ +-----------------+
         |  MongoDB Atlas   | |  Groq AI  | | Gemini AI  | | Ollama / Qdrant |
         | (Users, Progress,| | (Primary  | | (Fallback/ | | (Local Model/ |
         |   Challenges)    | | Provider) | | Multimodal)| | Vector Store) |
         +------------------+ +-----------+ +------------+ +-----------------+
```

### Flow Breakdown:
1. **User Action**: The student writes code in the Monaco Editor, requests an AI code repair, or answers an adaptive quiz.
2. **Frontend Dispatch**: Axios requests are dispatched with JWT Bearer tokens to `/api/*`.
3. **Backend Middleware**: Express validates authentication tokens via JWT middleware and logs user sessions.
4. **Service Dispatch**:
   - **Database Requests**: Mongoose connects to **MongoDB Atlas** for progress, user profiles, and challenges.
   - **AI Prompts**: Sent via `geminiService` / `groqService` with automatic multi-provider fallback.
   - **Document Queries**: Evaluated using `ragService` chunking & TF-IDF indexing.
5. **Response Delivery**: JSON payloads or plain text stream chunks are returned to update React component states in real-time.

---

## 📁 Project Directory Structure

```
CodeGalaxy AD/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection handler
│   ├── controllers/
│   │   ├── aiController.js       # AI chat, forge challenge, repair, & copilot logic
│   │   ├── authController.js     # User registration, login, & profile management
│   │   ├── challengeController.js# Coding challenge CRUD & submission verification
│   │   └── progressController.js # Gamification stats, XP, & leaderboards
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT route protection middleware
│   ├── models/
│   │   ├── Challenge.js          # Challenge schema & test cases
│   │   ├── LearningPath.js       # Adaptive learning tree schema
│   │   ├── SkillNode.js          # Planetary node schema
│   │   └── User.js               # User account, XP, level, & skill schema
│   ├── routes/
│   │   ├── aiRoutes.js           # AI endpoints (/api/ai)
│   │   ├── authRoutes.js         # Auth endpoints (/api/auth)
│   │   ├── challengeRoutes.js    # Challenge endpoints (/api/challenges)
│   │   ├── interviewPrepRoutes.js# Interview simulator endpoints (/api/interview-prep)
│   │   ├── learningRoutes.js     # Skill tree endpoints (/api/learning)
│   │   ├── progressRoutes.js     # Gamification endpoints (/api/progress)
│   │   └── ragRoutes.js          # Document & Image Q&A endpoints (/api/rag)
│   ├── services/
│   │   ├── geminiService.js      # Multi-provider router & Gemini API SDK
│   │   ├── groqService.js        # Groq LPU API service
│   │   ├── ollamaService.js      # Local Ollama fallback service
│   │   ├── qdrantService.js      # Vector database service scaffold
│   │   └── ragService.js         # TF-IDF & PDF document ingestion engine
│   ├── .env.example              # Environment variables template for backend
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express application entry point
├── frontend/
│   ├── public/                   # Static assets & game components
│   ├── src/
│   │   ├── components/           # UI components (Monaco Editor, Visualizers, Maps)
│   │   ├── contexts/             # React Context state management
│   │   ├── hooks/                # Voice recognition, TTS, & custom hooks
│   │   ├── pages/                # Main application pages & dashboards
│   │   ├── services/             # API client services
│   │   └── utils/                # Central Axios client (api.ts) & helper utilities
│   ├── .env.example              # Environment variables template for frontend
│   ├── package.json              # Frontend dependencies & scripts
│   ├── vercel.json               # Vercel deployment SPA rewrite configuration
│   └── vite.config.ts            # Vite configuration
├── .gitignore                    # Git tracking exclusion rules
├── package.json                  # Root monorepo orchestration configuration
└── README.md                     # Comprehensive project documentation
```

---

## 🛠️ Technology Stack

### Frontend Architecture
- **Core Framework**: React 18 + TypeScript + Vite
- **Styling & UI**: Tailwind CSS, Radix UI Primitives, Lucide Icons, Framer Motion
- **Code Editor**: `@monaco-editor/react`
- **Charts & Data Viz**: Recharts (Skill Radars, XP analytics)
- **HTTP Client**: Axios with JWT Interceptors

### Backend Architecture
- **Server Environment**: Node.js (v18+) + Express 5
- **Database**: MongoDB Atlas via Mongoose 9
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` password hashing
- **File & Document Processing**: `multer`, `pdf-parse`

### AI & Vector Infrastructure
- **Primary AI Provider**: Groq LPU Acceleration (`openai/gpt-oss-20b`, `qwen/qwen3.6-27b`)
- **Secondary AI Provider**: Google Gemini (`gemini-flash-latest`)
- **Local AI Fallback**: Ollama (`qwen2.5-coder`, `llama3.1`)
- **Vector DB Scaffold**: `@qdrant/js-client-rest`

---

## 🔌 API Endpoint Reference

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new user account |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & receive JWT |
| **AI** | `POST` | `/api/ai/copilot/analyze` | Real-time code logic & feedback analysis |
| **AI** | `POST` | `/api/ai/repair/diagnose` | Automated error diagnosis & fix suggestions |
| **AI** | `POST` | `/api/ai/forge/generate` | Generate dynamic coding challenge via AI |
| **AI** | `POST` | `/api/ai/chat` | Stream AI chat response chunks |
| **Learning** | `GET` | `/api/learning/levels` | Fetch planetary skill tree nodes |
| **Progress** | `GET` | `/api/progress/leaderboard` | Get global user XP leaderboards |
| **RAG** | `POST` | `/api/rag/upload` | Upload & ingest PDF/TXT/Image document |

---

## 💻 Local Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster URI)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/HarshKumar5822/CodeGalaxy-An-Agentic-AI-Based-Interactive-Programming-Learning-Platform.git
cd CodeGalaxy-An-Agentic-AI-Based-Interactive-Programming-Learning-Platform
```

### 2. Install Dependencies
```bash
# Install root monorepo & workspace dependencies
npm run install-all
```

### 3. Environment Configuration

Create a `.env` file in the `backend/` directory:
```env
PORT=5005
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/codegalaxy?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# AI Providers
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
GEMINI_KEY=your_gemini_api_key
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://127.0.0.1:5005/api
```

### 4. Run Locally

Start both Backend and Frontend concurrently from the root directory:
```bash
npm run start
```

Or run them individually in separate terminal windows:
```bash
# Terminal 1: Start Backend (Port 5005)
cd backend
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd frontend
npm run dev
```

---

## 🌐 Production Deployment

- **Backend (Render)**: Deployed as a Node.js Web Service with dynamic port binding and root directory set to `backend`.
- **Frontend (Vercel)**: Deployed as a Vite SPA with `frontend/vercel.json` rewrites (`/* -> index.html`) and `VITE_API_URL` environment variable.

---

<div align="center">

## 🎥 Project Demo

[Watch the Project Demo](https://drive.google.com/file/d/19MWn_W9F-VSoK7UXpruX3J6F-ZJKS0PE/view?usp=drive_link)

### 🌌 CodeGalaxy — Transforming Code Learning Into an Interactive Universe

**Created with ❤️ by [Harsh Kumar](https://github.com/HarshKumar5822)**

</div>
