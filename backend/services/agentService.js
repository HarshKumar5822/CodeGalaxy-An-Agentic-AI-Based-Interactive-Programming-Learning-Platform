// A simple "agentic" AI: given a task, it (1) PLANS the steps needed, (2) EXECUTES each step in
// order — feeding the results of earlier steps into later ones as context, so step N can build
// on step N-1 rather than working blind — and (3) FINALIZES everything into one consolidated
// deliverable. This is the classic planner -> executor -> synthesizer agent pattern, without
// needing external tool integrations to demonstrate the concept.

const geminiService = require('./geminiService');

const PLAN_SYSTEM_PROMPT = `You are a planning agent. Given a task, break it down into 3 to 6 concise, ordered, actionable steps required to complete it.
Respond with ONLY a JSON array of short strings — nothing else, no markdown code fences, no explanation.
Example response: ["Research X", "Draft an outline", "Write the first section", "Review and polish"]`;

const EXECUTE_SYSTEM_PROMPT = `You are an execution agent carrying out ONE step of a larger plan.
Produce the concrete, useful output for ONLY the current step — not the whole task.
Do not add meta-commentary like "As an AI..." or "Here is the result of this step:" — just give the actual content/result.
Use Markdown where helpful.`;

const FINALIZE_SYSTEM_PROMPT = `You are a senior agent producing the FINAL consolidated deliverable for the user.
Combine and synthesize all the step results below into one clean, well-organized final output (Markdown allowed: headings, bullet points, code blocks as appropriate).
Do not mention "steps", "the plan", or the process that produced this — just give the final answer/deliverable itself, as if you produced it directly.`;

const parsePlan = (raw) => {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((s) => String(s).trim()).filter(Boolean).slice(0, 8);
        }
    } catch {
        // fall through to line-based fallback below
    }
    // Fallback: the model didn't return strict JSON — try to salvage a step list from lines like
    // "1. Do X" or "- Do X".
    return raw
        .split('\n')
        .map((l) => l.replace(/^\s*[\d]+[\.\)]\s*|^\s*[-*]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 8);
};

const runAgent = async (task) => {
    // STEP 1: Plan
    const planRaw = await geminiService.generateWithSystemPrompt(PLAN_SYSTEM_PROMPT, `Task: ${task}`);
    const plan = parsePlan(planRaw);
    if (plan.length === 0) {
        throw new Error('Agent failed to produce a plan for this task.');
    }

    // STEP 2: Execute each planned step in order, giving the model everything decided/produced
    // so far so later steps are aware of earlier ones (this is what makes it a coherent
    // sequence rather than N independent, disconnected LLM calls).
    const stepResults = [];
    for (let i = 0; i < plan.length; i++) {
        const step = plan[i];
        const priorContext = stepResults
            .map((r, idx) => `Step ${idx + 1} ("${plan[idx]}") result:\n${r}`)
            .join('\n\n');

        const userPrompt = [
            `Overall Task: ${task}`,
            '',
            `Full Plan:\n${plan.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}`,
            priorContext ? `\nResults so far:\n${priorContext}` : '',
            `\nNow execute step ${i + 1}: "${step}"`,
        ].filter(Boolean).join('\n');

        const result = await geminiService.generateWithSystemPrompt(EXECUTE_SYSTEM_PROMPT, userPrompt);
        stepResults.push(result.trim());
    }

    // STEP 3: Finalize — synthesize everything into one deliverable
    const finalPrompt = [
        `Task: ${task}`,
        '',
        'Step-by-step results:',
        stepResults.map((r, idx) => `Step ${idx + 1} (${plan[idx]}):\n${r}`).join('\n\n'),
        '\nProduce the final consolidated output for the user.',
    ].join('\n');

    const finalOutput = await geminiService.generateWithSystemPrompt(FINALIZE_SYSTEM_PROMPT, finalPrompt);

    return {
        task,
        plan,
        stepResults,
        finalOutput: finalOutput.trim(),
    };
};

module.exports = { runAgent };
