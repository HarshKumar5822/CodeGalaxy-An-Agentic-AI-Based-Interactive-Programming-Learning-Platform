# 🔄 CodeGalaxy: UML Activity Diagram Specification

![CodeGalaxy Activity Diagram HD](file:///c:/Users/harsh/OneDrive/Desktop/CodeGalaxy%20AD/codegalaxy_activity_hd.png)

## Figure 6: Activity diagram for challenge submission: compilation/run-error handling, local test-case evaluation, and XP/level accounting on a fully-passing run.

---

### 1. Vector Mermaid Activity Flowchart

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#1e1e2e', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#38bdf8', 'lineColor': '#818cf8', 'secondaryColor': '#0f172a', 'tertiaryColor': '#1e293b' }}}%%
flowchart TD
    %% Initial Node
    START(["● Start"]):::startStyle --> SELECT["Select active SkillNode / Challenge"]:::procStyle
    SELECT --> WRITE["Write & test code in Monaco Editor"]:::procStyle
    WRITE --> SUBMIT["Submit code for execution"]:::procStyle

    %% First Decision: Compilation / Runtime Errors
    SUBMIT --> DEC_COMPILE{"Compilation / Run errors?"}:::decisionStyle

    %% Compile Error Branch (Yes)
    DEC_COMPILE -- "Yes" --> AI_DIAGNOSE["AI Agent diagnoses code & suggests repair"]:::aiStyle
    AI_DIAGNOSE --> SHOW_LOGS["Display sandbox console logs & AI advice"]:::aiStyle
    SHOW_LOGS --> WRITE

    %% Compile Error Branch (No)
    DEC_COMPILE -- "No" --> RUN_TESTS["Run local automated test cases"]:::procStyle

    %% Second Decision: Test Case Assertion Evaluation
    RUN_TESTS --> DEC_TESTS{"Do all test cases pass?"}:::decisionStyle

    %% Test Cases Fail (No)
    DEC_TESTS -- "No" --> SHOW_FAIL["Display failed inputs & differences"]:::failStyle
    SHOW_FAIL --> WRITE

    %% Test Cases Pass (Yes)
    DEC_TESTS -- "Yes" --> CALC_XP["Calculate XP rewards & check badge rules"]:::xpStyle
    CALC_XP --> UPDATE_DB["Update Level & Progress in MongoDB"]:::xpStyle
    UPDATE_DB --> END_NODE(["● End: Challenge Completed"]):::endStyle

    %% Styling Directives
    classDef startStyle fill:#dc2626,stroke:#f87171,stroke-width:2px,color:#ffffff;
    classDef endStyle fill:#b91c1c,stroke:#f87171,stroke-width:2px,color:#ffffff;
    classDef procStyle fill:#0e7490,stroke:#38bdf8,stroke-width:2px,color:#ffffff;
    classDef decisionStyle fill:#b45309,stroke:#fbbf24,stroke-width:2px,color:#ffffff;
    classDef aiStyle fill:#6b21a8,stroke:#c084fc,stroke-width:2px,color:#ffffff;
    classDef failStyle fill:#9a3412,stroke:#fb923c,stroke-width:2px,color:#ffffff;
    classDef xpStyle fill:#047857,stroke:#34d399,stroke-width:2px,color:#ffffff;
```

---

## 2. Activity Lifecycle & Transition Logic

### **1. Selection & Authoring**
- **Activity**: `Select active SkillNode / Challenge`
  - Learner selects a planetary skill node from the solar system map or clicks a challenge in the catalog.
- **Activity**: `Write & test code in Monaco Editor`
  - Monaco editor loads language boilerplates (`JavaScript`, `Python`, `C++`, `Java`). The learner edits and tests code interactively.
- **Activity**: `Submit code for execution`
  - Submits the solution payload to `/api/challenges/run` triggering the backend local sandbox execution engine.

---

### **2. Guard Condition 1: Compilation / Runtime Check**
- **Decision Node**: `Compilation / Run errors?`
  - Evaluates compiler status and runtime signals from [executeCode.js](file:///c:/Users/harsh/OneDrive/Desktop/CodeGalaxy%20AD/backend/utils/executeCode.js).
- **Branch: [Yes] (Compilation / Runtime Exception)**:
  - **Action**: `AI Agent diagnoses code & suggests repair`
    - Triggered via [aiController.js](file:///c:/Users/harsh/OneDrive/Desktop/CodeGalaxy%20AD/backend/controllers/aiController.js).
    - Multi-provider AI orchestrator analyzes `stderr` traces and code syntax without revealing full solution spoilers.
  - **Action**: `Display sandbox console logs & AI advice`
    - Renders compiler errors and suggested hints in the output panel.
  - **Loopback**: Transitions back to `Write & test code in Monaco Editor` for debugging.
- **Branch: [No] (Clean Compilation)**:
  - Proceeds immediately to automated test suite validation.

---

### **3. Guard Condition 2: Test Case Suite Validation**
- **Action**: `Run local automated test cases`
  - Iterates through the problem's predefined and hidden test cases, piping each input via `stdin` and checking stdout against expected outputs.
- **Decision Node**: `Do all test cases pass?`
- **Branch: [No] (Assertion Failure / Edge Case Missed)**:
  - **Action**: `Display failed inputs & differences`
    - Surfaces test input, expected output, and actual received output in the test feedback runner.
  - **Loopback**: Loops back to `Write & test code in Monaco Editor` to refine algorithm edge cases.
- **Branch: [Yes] (All Assertions Passed)**:
  - Triggers the gamification fulfillment pipeline.

---

### **4. Gamification Accounting & Termination**
- **Action**: `Calculate XP rewards & check badge rules`
  - Awards problem `xpReward` (e.g., +100 XP), increments consecutive activity streak, and evaluates badge criteria.
- **Action**: `Update Level & Progress in MongoDB`
  - Commits atomic update to [UserProgress.js](file:///c:/Users/harsh/OneDrive/Desktop/CodeGalaxy%20AD/backend/models/UserProgress.js), unlocking subsequent planetary nodes on the skill tree.
- **Final Node**: `● End: Challenge Completed`
  - Displays level-up banner and victory animations on the frontend.
