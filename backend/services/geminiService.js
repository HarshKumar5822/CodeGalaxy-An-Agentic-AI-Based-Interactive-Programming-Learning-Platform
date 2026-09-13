const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// NOTE: "gemini-1.5-flash" (the model this file used to hardcode) was shut down by Google.
// Every call below was silently failing and falling back to the static mock generators,
// which is why challenge generation / interview prep / code analysis all looked "dumb" or
// disconnected from the actual prompt. "gemini-flash-latest" is a Google-managed alias that
// always points at the current stable Flash model, so this file won't silently break again
// the next time Google retires a model version.
const TEXT_MODEL_NAME = "gemini-flash-latest";

// JSON-mode model: uses the SDK's native structured output instead of regex-scraping the
// response text for a `{...}` blob. This is far more reliable than hoping the model didn't
// wrap its JSON in a markdown fence or add commentary around it.
const jsonModel = genAI.getGenerativeModel({
    model: TEXT_MODEL_NAME,
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8,
    }
});

const model = jsonModel; // kept for backward compatibility with any external references
const ollamaService = require('./ollamaService');
const groqService = require('./groqService');

// AI_PROVIDER controls where these calls go:
//   "gemini" -> Gemini only (old behavior)
//   "ollama" -> your local Ollama install only (no API key/internet needed)
//   "groq"   -> Groq's hosted API only (needs GROQ_API_KEY; fastest option — LPU hardware)
//   "auto"   -> (default) try Gemini first, and if it errors for ANY reason (bad/expired key,
//               quota exceeded, no internet) automatically fall back to Groq (if configured),
//               then local Ollama (if running). If nothing works, the caller's existing mock
//               fallback kicks in.
const AI_PROVIDER = (process.env.AI_PROVIDER || 'auto').toLowerCase();

// Single choke point every JSON-producing prompt in this file goes through, instead of each
// function calling the Gemini SDK directly. Returns raw text for parseAiJson() to handle.
const callJsonModel = async (prompt) => {
    if (AI_PROVIDER === 'ollama') {
        return ollamaService.generateJSON(prompt);
    }

    if (AI_PROVIDER === 'groq') {
        return groqService.generateJSON(prompt);
    }

    if (AI_PROVIDER === 'gemini') {
        const result = await jsonModel.generateContent(prompt);
        return (await result.response).text();
    }

    // auto: Gemini first, then Groq, then Ollama as silent fallbacks
    try {
        const result = await jsonModel.generateContent(prompt);
        return (await result.response).text();
    } catch (geminiError) {
        console.warn("Gemini call failed, trying Groq:", geminiError?.message || geminiError);
        try {
            return await groqService.generateJSON(prompt);
        } catch (groqError) {
            console.warn("Groq call failed, falling back to local Ollama:", groqError?.message || groqError);
            return ollamaService.generateJSON(prompt);
        }
    }
};

// Robust JSON extraction: handles native JSON-mode responses (already clean JSON) as well as
// legacy/edge cases where the model still wraps output in ```json fences or adds stray text.
const parseAiJson = (text) => {
    if (!text) return null;
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e2) {
                console.error("AI JSON parse failed even after fallback extraction:", e2.message);
                return null;
            }
        }
        console.error("AI JSON parse failed, no JSON object found in response:", e.message);
        return null;
    }
};

const generateSkillProfile = async (assessmentResults) => {
    // Input: User's answers from pre-assessment
    // Output: Skill level classification (Beginner/Intermediate/Advanced)
    const prompt = `
    Analyze the following assessment results and strictly classify the student's skill level.
    Results: ${JSON.stringify(assessmentResults)}
    
    Output JSON format:
    {
        "skillMap": {
            "React": {"level": "Intermediate", "confidence": 80},
            "Node.js": {"level": "Beginner", "confidence": 60}
        },
        "recommendedPace": "Medium"
    }
    `;

    try {
        const text = await callJsonModel(prompt);
        // Simple extraction of JSON
        return parseAiJson(text) || null;
    } catch (error) {
        console.error("Gemini Error:", error);
        return null;
    }
};

const generateLearningPath = async (userProfile, goal) => {
    const prompt = `
    Create a personalized learning path for a student with this profile:
    ${JSON.stringify(userProfile)}
    Goal: ${goal}
    
    Generate a sequence of 5-10 modules.
    Output JSON format:
    {
        "nodes": [
            {"title": "Intro to React", "category": "Frontend", "difficulty": "Beginner", "estimatedTime": 20},
            {"title": "Hooks Deep Dive", "category": "Frontend", "difficulty": "Intermediate", "estimatedTime": 45}
        ]
    }
    `;

    try {
        const text = await callJsonModel(prompt);
        return parseAiJson(text) || null;
    } catch (error) {
        console.error("Gemini Path Gen Error:", error);
        return null;
    }
};

const getRemedialSuggestion = async (failedConcept) => {
    const prompt = `
    The student failed a quiz on: "${failedConcept}".
    Suggest a remedial topic or simpler explanation.
    Output JSON format:
    {
        "remedialTopic": "Basics of state",
        "explanation": "State is like a component's memory..."
    }
    `;
    try {
        const text = await callJsonModel(prompt);
        return parseAiJson(text) || null;
    } catch (error) {
        return null;
    }
};

const CHAT_SYSTEM_INSTRUCTION = (pageContext) => `You are "CodeGalaxy AI", an expert coding mentor, guide, and navigator for the CodeGalaxy learning platform.
Current context of what the user is looking at: ${pageContext}

Rules:
- Directly answer factual, conceptual, or "explain this" questions in full — do not withhold correct information.
- Only hold back a complete solution when the user is actively asking you to solve their current graded challenge for them; in that case guide step-by-step with hints instead of the final code.
- If the user asks for example code, syntax help, or "how do I do X" for something that is NOT the active challenge itself, give a real, working, directly usable code snippet.
- Be concise and concrete. Prefer short paragraphs, bullet points, and code blocks over vague encouragement.
- Use Markdown formatting (code fences with language tags for any code).
- If a question is ambiguous, make a reasonable assumption and answer it rather than only asking for clarification.
- If the "context" above lists specific modules/features of the current page, and the user asks about "this page", "these modules", "what's here", or similar, use those specifics to give a genuinely detailed walkthrough — not a generic guess.`;

const generateChatReplyViaGemini = async (message, history, pageContext) => {
    if (!apiKey) {
        throw new Error("Gemini API key is not configured on the backend server.");
    }

    const modelInstance = genAI.getGenerativeModel({
        model: TEXT_MODEL_NAME,
        systemInstruction: CHAT_SYSTEM_INSTRUCTION(pageContext)
    });

    // Format history for Gemini SDK: expects role: 'user' | 'model', parts: [{ text: '...' }]
    // Filter out the static welcome message and any empty-text turns, then make sure the
    // history starts on a 'user' turn (the Gemini API rejects history that opens on 'model').
    let formattedHistory = (history || [])
        .filter(msg => msg.id !== 'init-1' && msg.text && msg.text.trim().length > 0)
        .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
        formattedHistory.shift();
    }

    const chat = modelInstance.startChat({
        history: formattedHistory,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
        }
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();
    if (!responseText || !responseText.trim()) {
        throw new Error("Gemini returned an empty response.");
    }
    return responseText;
};

const generateChatReplyViaOllama = async (message, history, pageContext) => {
    const formattedHistory = (history || [])
        .filter(msg => msg.id !== 'init-1' && msg.text && msg.text.trim().length > 0)
        .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', text: msg.text }));

    const responseText = await ollamaService.generateChat(message, formattedHistory, CHAT_SYSTEM_INSTRUCTION(pageContext));
    if (!responseText || !responseText.trim()) {
        throw new Error("Ollama returned an empty response.");
    }
    return responseText;
};

const generateChatReplyViaGroq = async (message, history, pageContext) => {
    const formattedHistory = (history || [])
        .filter(msg => msg.id !== 'init-1' && msg.text && msg.text.trim().length > 0)
        .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', text: msg.text }));

    const responseText = await groqService.generateChat(message, formattedHistory, CHAT_SYSTEM_INSTRUCTION(pageContext));
    if (!responseText || !responseText.trim()) {
        throw new Error("Groq returned an empty response.");
    }
    return responseText;
};

const generateChatReply = async (message, history = [], pageContext = '') => {
    try {
        if (AI_PROVIDER === 'ollama') {
            return await generateChatReplyViaOllama(message, history, pageContext);
        }
        if (AI_PROVIDER === 'groq') {
            return await generateChatReplyViaGroq(message, history, pageContext);
        }
        if (AI_PROVIDER === 'gemini') {
            return await generateChatReplyViaGemini(message, history, pageContext);
        }
        // auto: Gemini first, then Groq, then Ollama
        try {
            return await generateChatReplyViaGemini(message, history, pageContext);
        } catch (geminiError) {
            console.warn("Gemini chat failed, trying Groq:", geminiError?.message || geminiError);
            try {
                return await generateChatReplyViaGroq(message, history, pageContext);
            } catch (groqError) {
                console.warn("Groq chat failed, falling back to local Ollama:", groqError?.message || groqError);
                return await generateChatReplyViaOllama(message, history, pageContext);
            }
        }
    } catch (error) {
        console.error("Gemini service chat error:", error?.message || error);
        throw error;
    }
};

// Streaming version of generateChatReply. Calls onToken(chunkText) as text arrives so the
// controller can flush it straight to the client (used by the chatbot widget so replies start
// appearing in ~1-2s instead of after the full generation finishes).
const generateChatReplyStream = async (message, history = [], pageContext = '', onToken = () => {}) => {
    const formattedOllamaHistory = (history || [])
        .filter(msg => msg.id !== 'init-1' && msg.text && msg.text.trim().length > 0)
        .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', text: msg.text }));

    const streamViaOllama = () =>
        ollamaService.generateChatStream(message, formattedOllamaHistory, CHAT_SYSTEM_INSTRUCTION(pageContext), onToken);

    const streamViaGroq = () =>
        groqService.generateChatStream(message, formattedOllamaHistory, CHAT_SYSTEM_INSTRUCTION(pageContext), onToken);

    const streamViaGemini = async () => {
        if (!apiKey) {
            throw new Error('Gemini API key is not configured on the backend server.');
        }
        const modelInstance = genAI.getGenerativeModel({
            model: TEXT_MODEL_NAME,
            systemInstruction: CHAT_SYSTEM_INSTRUCTION(pageContext)
        });

        let formattedHistory = (history || [])
            .filter(msg => msg.id !== 'init-1' && msg.text && msg.text.trim().length > 0)
            .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
        while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
            formattedHistory.shift();
        }

        const chat = modelInstance.startChat({
            history: formattedHistory,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        });

        const result = await chat.sendMessageStream(message);
        let fullText = '';
        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
                fullText += text;
                onToken(text);
            }
        }
        if (!fullText.trim()) {
            throw new Error('Gemini returned an empty response.');
        }
        return fullText;
    };

    if (AI_PROVIDER === 'ollama') {
        return streamViaOllama();
    }
    if (AI_PROVIDER === 'groq') {
        return streamViaGroq();
    }
    if (AI_PROVIDER === 'gemini') {
        return streamViaGemini();
    }
    // auto: Gemini first, then Groq, then Ollama. Note: if a provider fails partway through
    // streaming (after some tokens were already sent), we can't cleanly "undo" those on the
    // client, so fallback only reliably helps when a provider fails before it starts streaming
    // — which is the common case (bad key / quota / no internet / not running).
    try {
        return await streamViaGemini();
    } catch (geminiError) {
        console.warn('Gemini chat stream failed, trying Groq:', geminiError?.message || geminiError);
        try {
            return await streamViaGroq();
        } catch (groqError) {
            console.warn('Groq chat stream failed, falling back to local Ollama:', groqError?.message || groqError);
            return await streamViaOllama();
        }
    }
};

const generateCustomChallenge = async (userPrompt) => {
    const prompt = `
    You are an expert AI agent that designs programming challenges for the CodeGalaxy learning platform.
    Create a programming challenge based on the user's request: "${userPrompt}"
    
    The challenge must be a standard coding problem in Python/JS.
    Provide a starter code template in the 'template' field (e.g., Python starter code that defines a function and handles input or has comments).
    Provide 2-3 test cases. The inputs should be string representations of the arguments or direct input string.
    
    Output MUST be in strict JSON format (do not wrap in markdown \`\`\`json block, just return the raw JSON object string):
    {
        "title": "Short descriptive title",
        "description": "Markdown formatted description of the problem, including task, input/output specifications.",
        "difficulty": "Easy", // Must be "Easy", "Medium", or "Hard"
        "xpReward": 100, // XP points, usually 50 to 150
        "instructions": "Markdown formatted tactical briefing or instructions on how to solve it.",
        "template": "def solve(arg):\\n    # Write code here\\n    pass",
        "testCases": [
            {"input": "argument_value", "expectedOutput": "expected_value", "isHidden": false}
        ]
    }
    `;

    try {
        const text = await callJsonModel(prompt);
        return parseAiJson(text) || getMockForgeChallenge(userPrompt);
    } catch (error) {
        console.error("Gemini Custom Challenge Gen Error (Using local fallback):", error);
        return getMockForgeChallenge(userPrompt);
    }
};

const analyzeCodeFeedback = async (code, language, challengeTitle, challengeDescription) => {
    const prompt = `
    You are the "Logic Commander" Co-Pilot Agent for CodeGalaxy.
    Review the student's active code in the editor for the challenge "${challengeTitle}".
    
    Challenge Description:
    ${challengeDescription}
    
    Student's Code (${language}):
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Analyze the code for syntax issues, logic flow, off-by-one errors, infinite loops, and Big-O efficiency.
    Provide a JSON response containing your helpful, constructive, and concise guidance. Do NOT give the direct solution code.
    
    Output MUST be in strict JSON format (do not wrap in markdown \`\`\`json block, just return the raw JSON object string):
    {
        "status": "warning", // "warning" | "success" | "info" (warning if bug/inefficiency detected, success if looks perfect, info for generic suggestions)
        "hint": "Short encouraging diagnostic hint",
        "suggestions": [
            "Suggestion 1",
            "Suggestion 2"
        ],
        "complexity": "Estimated Time: O(N), Space: O(1)"
    }
    `;

    try {
        const text = await callJsonModel(prompt);
        return parseAiJson(text) || getMockCodeFeedback(code, language);
    } catch (error) {
        console.error("Gemini Code Analysis Error (Using local fallback):", error);
        return getMockCodeFeedback(code, language);
    }
};

const debugCodeError = async (code, language, errorMsg, testCases) => {
    const prompt = `
    You are the "Subsystem Repair Bot" debugging agent for CodeGalaxy.
    The student's code failed execution with a compiler or runtime error.
    
    Student's Code (${language}):
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Execution Error:
    ${errorMsg}
    
    Test Cases Context:
    ${JSON.stringify(testCases)}
    
    Diagnose the bug. Write a structured response in JSON format. Provide direct, step-by-step diagnostic actions (without giving the full solved code).
    
    Output MUST be in strict JSON format (do not wrap in markdown \`\`\`json block, just return the raw JSON object string):
    {
        "diagnosis": "Short explanation of why the crash/error occurred.",
        "steps": [
            "Step 1: Check line X where...",
            "Step 2: Initialize variable Y to..."
        ],
        "remedialCodeSnippet": "A tiny conceptual code snippet showing how to use a function or language feature properly, but not solving the actual challenge directly."
    }
    `;

    try {
        const text = await callJsonModel(prompt);
        return parseAiJson(text) || getMockDebugError(code, language, errorMsg);
    } catch (error) {
        console.error("Gemini Debug Error (Using local fallback):", error);
        return getMockDebugError(code, language, errorMsg);
    }
};

const getMockForgeChallenge = (userPrompt) => {
    const prompt = userPrompt || '';
    const promptLower = prompt.toLowerCase();
    
    // Default fallback values
    let title = "Custom Algorithmic Challenge";
    let description = `Implement the logic according to the request:\n\n> "${prompt}"\n\n### Task\nWrite an efficient solution to solve the prompt constraints.`;
    let difficulty = "Medium";
    let template = `def solve(data):\n    # Write your code here\n    return data`;
    let testCases = [
        { input: "[1, 2, 3]", expectedOutput: "[1, 2, 3]", isHidden: false }
    ];
    let instructions = "### Instructions\n- Read input arguments carefully.\n- Optimize for time and space complexity.";

    if (promptLower.includes("reverse") && (promptLower.includes("string") || promptLower.includes("text"))) {
        title = "Reverse String Constraints";
        description = "Write a function that takes a string as input and returns it reversed.\n\n### Task\nReturn the reversed string.";
        difficulty = "Easy";
        template = `def solve(s):\n    # Write your code here to reverse the string\n    return s[::-1]`;
        testCases = [
            { input: "'hello'", expectedOutput: "'olleh'", isHidden: false },
            { input: "'world'", expectedOutput: "'dlrow'", isHidden: false }
        ];
        instructions = "### Instructions\n- You can use slice notation or standard iteration.\n- Time complexity should be O(N).";
    } else if (promptLower.includes("reverse") && (promptLower.includes("array") || promptLower.includes("list"))) {
        title = "Reverse Array In-Place";
        description = "Write a function that reverses an array of elements.\n\n### Task\nReturn the reversed list.";
        difficulty = "Easy";
        template = `def solve(arr):\n    # Write your code here to reverse the array\n    return arr[::-1]`;
        testCases = [
            { input: "[1, 2, 3]", expectedOutput: "[3, 2, 1]", isHidden: false }
        ];
        instructions = "### Instructions\n- You can use slice notation or built-in functions.\n- Time complexity should be O(N).";
    } else if (promptLower.includes("palindrome")) {
        title = "Palindrome Check";
        description = "Verify if the input string is a palindrome (reads same forwards and backwards).\n\n### Task\nReturn True if palindrome, False otherwise.";
        difficulty = "Easy";
        template = `def solve(s):\n    # Write check here\n    cleaned = ''.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]`;
        testCases = [
            { input: "'racecar'", expectedOutput: "True", isHidden: false },
            { input: "'hello'", expectedOutput: "False", isHidden: false }
        ];
        instructions = "### Instructions\n- Ignore casing and non-alphanumeric characters.\n- Time complexity should be O(N).";
    } else if (promptLower.includes("anagram")) {
        title = "Anagram Check";
        description = "Given two strings, determine if they are anagrams of each other (contain the same characters in any order).\n\n### Task\nReturn True if anagrams, else False.";
        difficulty = "Medium";
        template = `def solve(s1, s2):\n    # Write anagram verification\n    return sorted(s1) == sorted(s2)`;
        testCases = [
            { input: "'listen', 'silent'", expectedOutput: "True", isHidden: false },
            { input: "'hello', 'world'", expectedOutput: "False", isHidden: false }
        ];
        instructions = "### Instructions\n- Sort the characters of both words and compare.\n- Time complexity O(N log N).";
    } else if (promptLower.includes("fizzbuzz") || promptLower.includes("fizz")) {
        title = "FizzBuzz Classic";
        description = "Return the FizzBuzz string representation up to number N.\n\n### Task\nFor numbers 1 to N, return 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, 'FizzBuzz' if both, otherwise the number string.";
        difficulty = "Easy";
        template = `def solve(n):\n    res = []\n    for i in range(1, n+1):\n        if i % 15 == 0: res.append("FizzBuzz")\n        elif i % 3 == 0: res.append("Fizz")\n        elif i % 5 == 0: res.append("Buzz")\n        else: res.append(str(i))\n    return res`;
        testCases = [
            { input: "15", expectedOutput: "['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']", isHidden: false }
        ];
        instructions = "### Instructions\n- Iterate from 1 to N inclusive.\n- Match modulo checks correctly.";
    } else if (promptLower.includes("fibonacci") || promptLower.includes("fib")) {
        title = "Fibonacci Sequence Term";
        description = "Return the N-th term in the Fibonacci sequence starting with F(0)=0 and F(1)=1.\n\n### Task\nCalculate the N-th term.";
        difficulty = "Easy";
        template = `def solve(n):\n    if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b`;
        testCases = [
            { input: "10", expectedOutput: "55", isHidden: false }
        ];
        instructions = "### Instructions\n- Use an iterative approach to achieve O(N) time and O(1) space.";
    } else if (promptLower.includes("prime") || promptLower.includes("factor")) {
        title = "Is Prime Verification";
        description = "Determine if the input integer N is a prime number.\n\n### Task\nReturn True if prime, else False.";
        difficulty = "Easy";
        template = `def solve(n):\n    if n < 2: return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0: return False\n    return True`;
        testCases = [
            { input: "17", expectedOutput: "True", isHidden: false },
            { input: "4", expectedOutput: "False", isHidden: false }
        ];
        instructions = "### Instructions\n- Iterate divisors up to square root of N for efficiency.";
    } else if (promptLower.includes("dock") || promptLower.includes("station")) {
        title = "Space Station Docking Ports";
        description = "Calculate the optimal docking sequence for incoming ships based on their priority and size.\n\n### Task\nSort the incoming ship registries to prevent orbital traffic crashes.";
        difficulty = "Medium";
        template = `def solve(ships):\n    # Sort ships by size desc, then priority asc\n    # Each ship is: {"size": int, "priority": int}\n    return sorted(ships, key=lambda s: (-s['size'], s['priority']))`;
        testCases = [
            { input: "[{'size': 10, 'priority': 1}, {'size': 20, 'priority': 2}]", expectedOutput: "[{'size': 20, 'priority': 2}, {'size': 10, 'priority': 1}]", isHidden: false }
        ];
        instructions = "### Tactical Briefing\n- Apply custom python sorting keys.\n- Size desc is achieved via negative value `-s['size']`.";
    } else if (promptLower.includes("packet") || promptLower.includes("debris") || promptLower.includes("filter")) {
        title = "Orbital Debris Filter";
        description = "Filter out space debris coordinate packets that fall inside the deflector shield radius.\n\n### Task\nWrite a function to return coordinates of debris outside the dangerous shield bounds.";
        difficulty = "Easy";
        template = `def solve(packets, radius):\n    # Return coordinates where distance is greater than radius\n    # packet coordinate is: [x, y]\n    import math\n    return [p for p in packets if math.sqrt(p[0]**2 + p[1]**2) > radius]`;
        testCases = [
            { input: "[[1, 2], [10, 10]], 5", expectedOutput: "[[10, 10]]", isHidden: false }
        ];
        instructions = "### Tactical Briefing\n- Compute euclidean distance of each particle coordinate from origin (0,0).\n- If distance exceeds shield radius, the debris is safe.";
    } else {
        const words = prompt.trim().split(/\s+/).slice(0, 4);
        const autoTitle = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        if (autoTitle.length > 3) {
            title = autoTitle;
        }
        
        if (promptLower.includes("easy")) {
            difficulty = "Easy";
        } else if (promptLower.includes("hard") || promptLower.includes("complex") || promptLower.includes("difficult")) {
            difficulty = "Hard";
        }
        
        let argName = "x";
        if (promptLower.includes("array") || promptLower.includes("list") || promptLower.includes("numbers")) {
            argName = "arr";
            template = `def solve(${argName}):\n    # Write your solution here for: ${prompt.replace(/\n/g, ' ')}\n    return ${argName}`;
            testCases = [
                { input: "[10, 20, 30]", expectedOutput: "[10, 20, 30]", isHidden: false }
            ];
        } else if (promptLower.includes("string") || promptLower.includes("text") || promptLower.includes("word")) {
            argName = "s";
            template = `def solve(${argName}):\n    # Write your solution here for: ${prompt.replace(/\n/g, ' ')}\n    return ${argName}`;
            testCases = [
                { input: "'sample_data'", expectedOutput: "'sample_data'", isHidden: false }
            ];
        } else if (promptLower.includes("number") || promptLower.includes("int") || promptLower.includes("count")) {
            argName = "n";
            template = `def solve(${argName}):\n    # Write your solution here for: ${prompt.replace(/\n/g, ' ')}\n    return ${argName}`;
            testCases = [
                { input: "5", expectedOutput: "5", isHidden: false }
            ];
        } else {
            template = `def solve(data):\n    # Write your solution here for: ${prompt.replace(/\n/g, ' ')}\n    return data`;
            testCases = [
                { input: "[1, 2, 3]", expectedOutput: "[1, 2, 3]", isHidden: false }
            ];
        }
    }

    return {
        title,
        description,
        difficulty,
        xpReward: 120,
        instructions,
        template,
        testCases
    };
};

const getMockCodeFeedback = (code, language) => {
    return {
        status: "warning",
        hint: "Logic Commander detected potential logic issues. (Running local diagnostic backup)",
        suggestions: [
            "Check for off-by-one errors in loops and index iterations.",
            "Verify variable scopes and return parameters.",
            "Handle edge cases such as empty lists or missing keys."
        ],
        complexity: "Estimated Time: O(N), Space: O(N) (Local Analysis)"
    };
};

const getMockDebugError = (code, language, errorMsg) => {
    return {
        diagnosis: `Subsystem Repair Bot Diagnostic: Execution trace reports: ${errorMsg || 'Runtime Warning'}`,
        steps: [
            "Verify indent levels or curly brackets syntax.",
            "Ensure variables referenced are declared and initialized in scope.",
            "Validate return types to match the expected example outputs."
        ],
        remedialCodeSnippet: language === 'python' ? "# Safe indexing pattern:\nif index < len(array):\n    process(array[index])" : "// Safe indexing pattern:\nif (index < array.length) {\n    process(array[index]);\n}"
    };
};

const generateInterviewQuiz = async (language, level, weakTopics = []) => {
    const prompt = `
    You are an AI interviewer for CodeGalaxy. Generate 5 multiple-choice questions for technical interview preparation in ${language} at a ${level} level.
    Focus on these weak areas if specified: ${JSON.stringify(weakTopics)}.
    Ensure questions test different concepts (MCQs, Output prediction, Debugging, Concepts).
    
    Output MUST be in strict JSON format (do not wrap in markdown \`\`\`json block, just return the raw JSON object string):
    {
      "questions": [
        {
          "question": "Question text...",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctOption": 0, // index of correct option (0-3)
          "explanation": "Markdown explanation...",
          "type": "MCQ" // 'MCQ' | 'Concept' | 'Prediction' | 'Debugging' | 'Interview'
        }
      ]
    }
    `;

    try {
        const text = await callJsonModel(prompt);
        return parseAiJson(text) || getMockInterviewQuiz(language, level);
    } catch (error) {
        console.error("Gemini Quiz Gen Error (Using fallback):", error);
        return getMockInterviewQuiz(language, level);
    }
};

const generateInterviewCoding = async (language, level, weakTopics = []) => {
    const prompt = `
    Generate a coding challenge for a technical interview in ${language} at a ${level} level.
    Focus on these weak areas if specified: ${JSON.stringify(weakTopics)}.
    
    Output MUST be in strict JSON format (do not wrap in markdown \`\`\`json block, just return the raw JSON object string):
    {
      "title": "Problem Title",
      "description": "Problem description in Markdown, including example input and expected output.",
      "exampleInput": "Example input text...",
      "exampleOutput": "Example output text...",
      "constraints": "Constraints in Markdown...",
      "difficulty": "${level}",
      "template": "def solve(arr):\\n    # starter code template\\n    pass",
      "testCases": [
        {"input": "argument_val", "expectedOutput": "expected_val"}
      ]
    }
    `;

    try {
        const text = await callJsonModel(prompt);
        return parseAiJson(text) || getMockInterviewCoding(language, level);
    } catch (error) {
        console.error("Gemini Coding Gen Error (Using fallback):", error);
        return getMockInterviewCoding(language, level);
    }
};

const evaluateInterviewCode = async (code, language, problemTitle, problemDescription, runResult) => {
    const prompt = `
    You are an AI interviewer for CodeGalaxy. Evaluate the student's solution to the coding problem "${problemTitle}".
    
    Problem Description:
    ${problemDescription}
    
    Student's Code (${language}):
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Local Execution Result:
    ${JSON.stringify(runResult)}
    
    Provide code correctness, logic score (0-100), style score (0-100), Big-O time and space complexity, and specific recommendations or correction steps if incorrect.
    
    Output MUST be in strict JSON format (do not wrap in markdown \`\`\`json block, just return the raw JSON object string):
    {
      "passed": ${runResult?.success ? 'true' : 'false'},
      "timeComplexity": "O(...) ",
      "spaceComplexity": "O(...)",
      "logicScore": 90,
      "styleScore": 85,
      "feedback": "Detailed review in Markdown...",
      "optimizedCode": "An optimized implementation code string..."
    }
    `;

    try {
        const text = await callJsonModel(prompt);
        return parseAiJson(text) || getMockInterviewCodeEvaluation(code, language, runResult);
    } catch (error) {
        console.error("Gemini Code Eval Error (Using fallback):", error);
        return getMockInterviewCodeEvaluation(code, language, runResult);
    }
};

const generateInterviewQuestion = async (language, level, chatHistory = []) => {
    const prompt = `
    You are a professional technical interviewer interviewing a candidate for a ${language} position at a ${level} level.
    Conduct a realistic interview. Ask technical questions one-by-one.
    Do not ask more than one question at a time.
    
    Chat History:
    ${JSON.stringify(chatHistory)}
    
    Determine if the interview is completed (usually 5 questions have been asked and answered).
    Provide interviewer response, next question, and whether it's completed.
    
    Output MUST be in strict JSON format (do not wrap in markdown \`\`\`json block, just return the raw JSON object string):
    {
      "response": "Brief feedback to the candidate's previous response.",
      "nextQuestion": "The next technical question to ask the candidate.",
      "isCompleted": false // Set to true if the interview is finished (5 questions completed)
    }
    `;

    try {
        const text = await callJsonModel(prompt);
        return parseAiJson(text) || getMockInterviewQuestion(chatHistory, language, level);
    } catch (error) {
        console.error("Gemini Interview Question Error (Using fallback):", error);
        return getMockInterviewQuestion(chatHistory, language, level);
    }
};

const evaluateSimulatedInterview = async (chatHistory, language, level) => {
    const prompt = `
    Evaluate the simulated technical interview history for a ${language} developer at a ${level} level.
    Grade the candidate's explanations, code, and overall performance.
    
    Chat History:
    ${JSON.stringify(chatHistory)}
    
    Output MUST be in strict JSON format (do not wrap in markdown \`\`\`json block, just return the raw JSON object string):
    {
      "score": 85, // 0-100
      "rating": "Strong Pass", // "Strong Pass" | "Pass" | "Borderline" | "Fail"
      "weakAreas": ["Concept A", "Concept B"],
      "roadmap": ["Step 1: Read about X", "Step 2: Practice Y"]
    }
    `;

    try {
        const text = await callJsonModel(prompt);
        return parseAiJson(text) || getMockInterviewEvaluation(chatHistory, language, level);
    } catch (error) {
        console.error("Gemini Interview Evaluation Error (Using fallback):", error);
        return getMockInterviewEvaluation(chatHistory, language, level);
    }
};

const getMockInterviewQuiz = (language, level) => {
    return {
      "questions": [
        {
          "question": `Which of the following is correct about variable scopes in ${language}?`,
          "options": ["They are globally scoped by default", "They are locally scoped within functions", "They do not exist", "They are block-scoped only"],
          "correctOption": 1,
          "explanation": "In most languages (including Python and JavaScript), variables defined inside a function are local to that function's execution namespace.",
          "type": "MCQ"
        },
        {
          "question": `What is the expected complexity of standard lookup operations in a hash table?`,
          "options": ["O(N)", "O(log N)", "O(1)", "O(N log N)"],
          "correctOption": 2,
          "explanation": "Average case complexity of hash lookup is O(1) constant time, assuming a good hash function.",
          "type": "Concept"
        },
        {
          "question": `What does the following snippet evaluate to?\n\n# Code:\nx = [1, 2, 3]\nprint(x[1:])`,
          "options": ["[1]", "[2, 3]", "[1, 2]", "[3]"],
          "correctOption": 1,
          "explanation": "Slicing starting at index 1 returns all elements from index 1 to the end of the array.",
          "type": "Prediction"
        },
        {
          "question": `Find the bug in this function:\n\ndef find_sum(n):\n    total = 0\n    for i in range(n):\n    return total`,
          "options": ["No bug", "Missing colon", "Incorrect return indentation", "Variable total is not initialized"],
          "correctOption": 2,
          "explanation": "The return statement is indented inside the loop, causing it to return immediately on the first iteration.",
          "type": "Debugging"
        },
        {
          "question": `In a technical interview, why is it preferred to use iterative solutions over recursion for deep trees?`,
          "options": ["To avoid Stack Overflow due to call stack limits", "To run in O(1) time", "Iterative solutions are always shorter", "Recursion is deprecated"],
          "correctOption": 0,
          "explanation": "Recursive calls build frames on the execution stack. If call depth is high, it can exhaust space and throw stack overflows.",
          "type": "Interview"
        }
      ]
    };
};

const getMockInterviewCoding = (language, level) => {
    const isPython = (language || '').toLowerCase() === 'python';
    return {
      "title": "Reverse Array In-Place",
      "description": `Write a function to reverse a list in-place. You must modify the input array directly without allocating extra space for another array.`,
      "exampleInput": "[1, 2, 3, 4, 5]",
      "exampleOutput": "[5, 4, 3, 2, 1]",
      "constraints": "Time Complexity: O(N)\nSpace Complexity: O(1) auxiliary",
      "difficulty": level,
      "template": isPython 
        ? "def solve(arr):\n    # Write your code here\n    pass" 
        : "function solve(arr) {\n    // Write your code here\n}",
      "testCases": [
        {"input": "[1, 2, 3]", "expectedOutput": "[3, 2, 1]"}
      ]
    };
};

const getMockInterviewCodeEvaluation = (code, language, runResult) => {
    return {
      "passed": runResult?.success || false,
      "timeComplexity": "O(N)",
      "spaceComplexity": "O(1)",
      "logicScore": runResult?.success ? 95 : 40,
      "styleScore": 85,
      "feedback": runResult?.success 
        ? "Great job! The solution reverses the array correctly in O(N) time and O(1) auxiliary memory. Code style matches clean coding standards." 
        : "Your solution failed execution or produced incorrect output. Check variable swapping logic and loop bounds.",
      "optimizedCode": language === 'javascript' || language === 'js'
        ? "function solve(arr) {\n    let left = 0, right = arr.length - 1;\n    while (left < right) {\n        let temp = arr[left];\n        arr[left] = arr[right];\n        arr[right] = temp;\n        left++;\n        right--;\n    }\n    return arr;\n}"
        : "def solve(arr):\n    left, right = 0, len(arr) - 1\n    while left < right:\n        arr[left], arr[right] = arr[right], arr[left]\n        left += 1\n        right -= 1\n    return arr"
    };
};

const getMockInterviewQuestion = (chatHistory, language, level) => {
    const qCount = chatHistory.filter(m => m.sender === 'user').length;
    const questions = [
      `Welcome to your ${language} interview! To start, can you explain the difference between local and global variables?`,
      "Excellent. Next, how does memory allocation work for objects and references?",
      "Good. Let's discuss performance. What is the Big-O time complexity of searching in a balanced binary search tree?",
      "Correct. Now, how would you handle resource leaks (like open database connections or file handlers)?",
      "Great. For our final question, what is your approach to debugging asynchronous exceptions or race conditions?"
    ];

    const response = qCount > 0 ? "That is a solid explanation. You hit the key points." : "Hello! Let's begin.";
    const isCompleted = qCount >= 5;
    const nextQuestion = isCompleted ? "" : questions[Math.min(qCount, questions.length - 1)];

    return {
      response,
      nextQuestion,
      isCompleted
    };
};

const getMockInterviewEvaluation = (chatHistory, language, level) => {
    return {
      "score": 88,
      "rating": "Pass",
      "weakAreas": ["Asynchronous exception handling", "Memory bounds checking"],
      "roadmap": [
        `Step 1: Read standard concurrency manuals for ${language}.`,
        "Step 2: Solve 3 debugging challenges related to memory leakage."
      ]
    };
};

// Startup diagnostic: makes one tiny real call to Gemini and one reachability check to Ollama
// so the server console tells you plainly, on boot, whether each provider is actually usable —
// instead of you finding out only when a feature silently falls back to mock data.
const checkAiProviders = async () => {
    console.log(`\n[AI] Provider mode: ${AI_PROVIDER}`);

    if (!apiKey) {
        console.log('[AI] Gemini:  ✗ No GEMINI_KEY set in backend/.env');
    } else {
        try {
            const result = await genAI.getGenerativeModel({ model: TEXT_MODEL_NAME }).generateContent("Reply with just: OK");
            const text = (await result.response).text();
            console.log(`[AI] Gemini:  ✓ Key is valid, model "${TEXT_MODEL_NAME}" responded ("${text.trim().slice(0, 30)}")`);
        } catch (err) {
            console.log(`[AI] Gemini:  ✗ Call failed — ${err?.message || err}`);
            console.log('[AI]          (Check the key is correct/unexpired and not over its free quota.)');
        }
    }

    try {
        if (!groqService.isGroqConfigured()) {
            console.log('[AI] Groq:    ✗ No GROQ_API_KEY set in backend/.env');
        } else {
            const reply = await groqService.generateChat('Reply with just: OK', [], '');
            console.log(`[AI] Groq:    ✓ Key is valid, model "${groqService.GROQ_CHAT_MODEL}" responded ("${(reply || '').trim().slice(0, 30)}")`);
        }
    } catch (err) {
        console.log(`[AI] Groq:    ✗ Call failed — ${err?.message || err}`);
        console.log('[AI]          (Check the key is correct and the model ID hasn\'t been deprecated: https://console.groq.com/docs/deprecations)');
    }

    try {
        const reachable = await ollamaService.isOllamaReachable();
        console.log(reachable
            ? `[AI] Ollama:  ✓ Reachable at ${ollamaService.OLLAMA_BASE_URL} (models: ${ollamaService.OLLAMA_JSON_MODEL} / ${ollamaService.OLLAMA_CHAT_MODEL})`
            : `[AI] Ollama:  ✗ Not reachable at ${ollamaService.OLLAMA_BASE_URL} (run 'ollama serve' if you want the local fallback)`
        );
    } catch (err) {
        console.log(`[AI] Ollama:  ✗ Check failed — ${err?.message || err}`);
    }
    console.log('');
};

// Generic single-turn "system prompt + user prompt -> text" call that goes through the exact
// same AI_PROVIDER selection/fallback logic as the rest of this file (gemini / groq / ollama /
// auto). Used by features that aren't part of the main chatbot conversation — RAG document
// Q&A, prompt-chaining, and the planning agent — so they automatically respect whichever
// provider is configured in .env instead of hardcoding one.
const generateWithSystemPrompt = async (systemPrompt, userPrompt) => {
    const callOllama = () => ollamaService.generateChat(userPrompt, [], systemPrompt);
    const callGroq = () => groqService.generateChat(userPrompt, [], systemPrompt);
    const callGemini = async () => {
        if (!apiKey) {
            throw new Error('Gemini API key is not configured on the backend server.');
        }
        const modelInstance = genAI.getGenerativeModel({
            model: TEXT_MODEL_NAME,
            systemInstruction: systemPrompt
        });
        const result = await modelInstance.generateContent(userPrompt);
        const text = (await result.response).text();
        if (!text || !text.trim()) {
            throw new Error('Gemini returned an empty response.');
        }
        return text;
    };

    if (AI_PROVIDER === 'ollama') return callOllama();
    if (AI_PROVIDER === 'groq') return callGroq();
    if (AI_PROVIDER === 'gemini') return callGemini();

    // auto: Gemini -> Groq -> Ollama
    try {
        return await callGemini();
    } catch (geminiError) {
        console.warn('generateWithSystemPrompt: Gemini failed, trying Groq:', geminiError?.message || geminiError);
        try {
            return await callGroq();
        } catch (groqError) {
            console.warn('generateWithSystemPrompt: Groq failed, falling back to Ollama:', groqError?.message || groqError);
            return await callOllama();
        }
    }
};

module.exports = {
    generateSkillProfile,
    generateLearningPath,
    getRemedialSuggestion,
    generateChatReply,
    generateChatReplyStream,
    generateCustomChallenge,
    analyzeCodeFeedback,
    debugCodeError,
    generateInterviewQuiz,
    generateInterviewCoding,
    evaluateInterviewCode,
    generateInterviewQuestion,
    evaluateSimulatedInterview,
    checkAiProviders,
    generateWithSystemPrompt,
};

