# 📊 CodeGalaxy: Data Flow Diagram (DFD) Specification

![CodeGalaxy Data Flow Diagram HD](file:///c:/Users/harsh/OneDrive/Desktop/CodeGalaxy%20AD/codegalaxy_dfd_hd.png)

## Figure 2: Data flow for the two dominant request paths — code execution and AI-assisted feedback

This diagram maps out the data transformations and request lifecycles across the seven numbered steps between the **Learner**, the **Interactive Frontend UI**, the **Backend Engine**, the **Agentic AI Orchestrator**, and the **MongoDB Database**.

---

### 1. Vector Mermaid DFD

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#1e1e2e', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#38bdf8', 'lineColor': '#818cf8', 'secondaryColor': '#0f172a', 'tertiaryColor': '#1e293b' }}}%%
flowchart TB
    %% External Entities
    USER(["👤 Learner / User"]):::userStyle

    %% Process Nodes
    subgraph UI_SYS["🖥️ Interactive Frontend UI"]
        FRONTEND["Monaco Editor & Visualizer<br/>(React 18 + TS + Vite)"]:::procStyle
    end

    subgraph BACKEND_SYS["⚙️ Backend Engine"]
        BACKEND["Local Code Sandbox & API<br/>(Express.js + Node.js)"]:::procStyle
    end

    subgraph AI_SYS["🤖 AI Orchestrator"]
        AI["Agentic AI Core<br/>(Gemini, Groq, Ollama Agents)"]:::procStyle
    end

    %% Data Stores
    subgraph STORAGE_SYS["💾 Data Stores"]
        DB[("🍃 MongoDB Database<br/>(Progress, Badges, Challenges)")]:::dbStyle
    end

    %% Flow Steps
    USER -- "Step 1: Writes Code / Asks Questions" --> FRONTEND
    FRONTEND -- "Step 2: Runs Code & Saves Progress / Requests AI Analysis" --> BACKEND
    BACKEND -- "Step 3: Compiles & Sandbox Runs (C/C++/Java/Py/JS)" --> BACKEND
    BACKEND -- "Step 4: Sends Prompt Context & Code State" --> AI
    BACKEND <--> "Step 5: Reads / Writes User XP, Badges & Progress" --> DB
    AI -- "Step 6: Returns Explanation, Fixes & Step Plan" --> BACKEND
    BACKEND -- "Step 7: Outputs Results, Metrics & Visual Steps" --> FRONTEND
    FRONTEND -- "Displays Code Visualizations & Feedback" --> USER

    %% Styling
    classDef userStyle fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#ffffff;
    classDef procStyle fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#ffffff;
    classDef dbStyle fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#ffffff;
```

---

## 2. Step-by-Step Data Flow Analysis

### **Step 1: User Input & Interaction**
- **Trigger**: The learner writes code in the Monaco Editor, modifies problem inputs, triggers an AI code explanation, or initiates an interview simulator question.
- **Payload**: Raw source code (JavaScript, Python, C++, Java), standard input data (`stdin`), active problem ID, and session authentication JWT token.

### **Step 2: Request Dispatch & Pre-processing**
- **Action**: The frontend dispatches an asynchronous Axios request (`POST /api/challenges/run` or `POST /api/ai/repair/diagnose` or `POST /api/ai/copilot/analyze`).
- **Processing**: The backend `authMiddleware` validates the JWT token, extracts `req.user`, and verifies the payload structure.

### **Step 3: Sandboxed Local Compilation & Execution**
- **Subsystem**: `executeCode.js` within the backend engine.
- **Action**: 
  1. Writes the code to a temporary UUID-labeled file in `temp_codes/`.
  2. Spawns isolated operating system compiler/runtime processes (`g++`, `gcc`, `python`, `node`, `javac`).
  3. Binds execution to an **8-second safety timeout** and passes problem test inputs via `stdin`.
  4. Collects `stdout`, `stderr`, status codes, and execution duration.

### **Step 4: AI Context Assembly & Prompt Dispatch**
- **Subsystem**: `aiController.js` and `agentService.js`.
- **Action**: If the learner requested an explanation, diagnosis, or dynamic challenge generation, the backend constructs a structured context prompt consisting of:
  - Active problem statement and requirements
  - User's active code snippet
  - Compiler diagnostics (`stderr`) or runtime errors
  - Target language bounds and guidelines
- Dispatches context payload through the multi-provider router (**Groq LPU** ➔ **Gemini** ➔ **Ollama**).

### **Step 5: Database Persistence & State Sync**
- **Subsystem**: MongoDB Atlas via Mongoose 9 models (`User`, `UserProgress`, `Challenge`).
- **Action**:
  - **Read**: Fetches user progress, challenge test cases, badges, and learning path position.
  - **Write**: On successful challenge pass, writes earned XP rewards, increments streak counters, unlocks planetary nodes, and logs submission records.

### **Step 6: AI Inference & Synthesis**
- **Action**: The AI Orchestrator executes inference.
- **Workflow**: For complex requests, `agentService.js` coordinates the **Planner ➔ Executor ➔ Synthesizer** cycle, generating:
  - Root cause analysis of compilation/logic bugs
  - Non-spoiler hints and algorithmic guidance
  - Space and time complexity asymptotic bounds ($O(N)$, $O(1)$)
- Returns structured JSON or chunked markdown stream back to the Express controller.

### **Step 7: Delivery & Interactive Visualization**
- **Action**: Backend returns consolidated HTTP 200 response with execution outputs and AI suggestions.
- **Frontend Reaction**:
  - Monaco Editor highlights error line numbers and diffs.
  - Test case runner displays pass/fail badges with execution timings.
  - Algorithm Visualizer animates sorting/pointer transitions step-by-step.
  - LevelMap updates planetary unlock animations and XP indicators.
