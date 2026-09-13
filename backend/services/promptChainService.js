// Multi-step "prompt chaining" workflow: three separate LLM calls run in sequence, where each
// step's output becomes part of the next step's input — as opposed to asking for everything in
// one giant prompt. This makes each step more focused/reliable, and lets us show the user the
// intermediate reasoning (summary -> key points -> questions) rather than a black box.

const geminiService = require('./geminiService');

const runPromptChain = async (topic) => {
    // Step 1: Summary
    const summary = await geminiService.generateWithSystemPrompt(
        'You are a clear, concise technical writer. Summarize the given topic in 3-5 sentences, in plain language a student could follow. Do not use headings or bullet points — just flowing prose.',
        `Topic: ${topic}`
    );

    // Step 2: Key points (built on top of the summary from step 1)
    const keyPoints = await geminiService.generateWithSystemPrompt(
        'You are an expert analyst. Given a topic and its summary, extract exactly 5 key points as a Markdown bullet list ("- point"). Each point should be specific, non-redundant, and one line long.',
        `Topic: ${topic}\n\nSummary:\n${summary}\n\nExtract exactly 5 key points as a bullet list.`
    );

    // Step 3: Questions (built on top of both the summary AND key points from steps 1-2)
    const questions = await geminiService.generateWithSystemPrompt(
        'You are a thoughtful teacher writing a short quiz. Given a topic, its summary, and key points, write EXACTLY 3 insightful questions (numbered "1.", "2.", "3.") that test real understanding of the topic. Do not answer them — questions only.',
        `Topic: ${topic}\n\nSummary:\n${summary}\n\nKey Points:\n${keyPoints}\n\nWrite exactly 3 numbered questions testing understanding of this topic.`
    );

    return {
        topic,
        steps: [
            { name: 'Summary', output: summary.trim() },
            { name: 'Key Points', output: keyPoints.trim() },
            { name: 'Questions', output: questions.trim() },
        ],
    };
};

module.exports = { runPromptChain };
