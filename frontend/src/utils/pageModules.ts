// Rich per-route context for the AI chatbot's "page awareness".
//
// The chatbot needs to answer questions like "explain the modules on this page" with real,
// specific detail — not a vague guess. A plain one-line-per-route description (what existed
// before) doesn't give the LLM enough to work with. This registry instead lists each page's
// actual modules/features with a short explanation of what each one does, formatted into the
// system prompt context so the assistant can genuinely walk the user through what they're
// looking at, section by section.
//
// Keep entries here in sync with what's actually rendered on each page — stale descriptions are
// worse than none, since the assistant will confidently describe something that no longer exists.

export interface PageModule {
  name: string;
  description: string;
}

export interface PageInfo {
  title: string;
  summary: string;
  modules: PageModule[];
}

export const PAGE_REGISTRY: Record<string, PageInfo> = {
  '/': {
    title: 'Landing Page',
    summary: 'The public homepage introducing CodeGalaxy to visitors who have not signed up yet.',
    modules: [
      { name: 'Hero section', description: 'Headline pitch for the platform with a call-to-action to sign up or log in.' },
      { name: 'Feature highlights', description: 'Cards summarizing what CodeGalaxy offers: challenges, learning paths, AI mentor, leaderboard, etc.' },
      { name: 'Auth modal', description: 'A login/signup form that opens as an overlay without leaving the page.' },
    ],
  },
  '/dashboard': {
    title: 'Dashboard',
    summary: "The logged-in user's home base showing overall progress and quick links to continue learning.",
    modules: [
      { name: 'Progress overview', description: "Summary stats — XP earned, challenges completed, current streak, and skill level." },
      { name: 'Recent activity', description: 'A feed of the most recent challenges attempted, badges earned, or learning nodes completed.' },
      { name: 'Recommended next steps', description: 'AI-suggested challenges or learning nodes based on the current skill profile.' },
      { name: 'Quick navigation', description: 'Shortcut cards to jump straight into Challenges, Learning Path, or Interview Prep.' },
    ],
  },
  '/notes': {
    title: 'My Notes',
    summary: 'A personal notes workspace where the user can save and organize their own learning notes.',
    modules: [
      { name: 'Notes list', description: 'All saved notes, browsable and searchable.' },
      { name: 'Note editor', description: 'A rich text/markdown editor for writing and editing a note.' },
    ],
  },
  '/learning-path': {
    title: 'Learning Path',
    summary: 'A visual, node-based map of structured learning content the user progresses through.',
    modules: [
      { name: 'Stack/level selector', description: 'Lets the user pick a tech stack (e.g. Web Dev, DSA) and difficulty level to focus on.' },
      { name: 'Interactive node map', description: 'A visual graph of learning nodes (topics/lessons) connected in a progression, showing which are locked, in-progress, or completed.' },
      { name: 'Node quiz', description: 'Each learning node ends in a short quiz to test understanding before unlocking the next node.' },
      { name: 'Progress tracking', description: "Tracks and syncs the user's completion state per node against their account." },
    ],
  },
  '/challenges': {
    title: 'Challenges',
    summary: 'A browsable list of standalone coding challenges (algorithms/data structures) independent of the learning path.',
    modules: [
      { name: 'Challenge list', description: 'All available challenges, filterable by difficulty, topic, or tags.' },
      { name: 'Difficulty/category filters', description: 'Narrow the list down to specific difficulty levels or problem categories.' },
    ],
  },
  '/ai-generator': {
    title: 'AI Generator',
    summary: 'Lets the user describe a custom coding challenge in plain language and have the AI generate it on demand.',
    modules: [
      { name: 'Prompt input', description: 'A text box (with voice dictation support) where the user describes the challenge concept they want.' },
      { name: 'Difficulty selector', description: 'Choose how hard the generated challenge should be.' },
      { name: 'Generated challenge preview', description: 'Shows the AI-generated problem statement, constraints, and starter code before the user starts solving it.' },
    ],
  },
  '/leaderboard': {
    title: 'Leaderboard',
    summary: 'Global rankings of users by XP and challenges completed.',
    modules: [
      { name: 'Ranking table', description: 'Top users ranked by XP, updated in real time as people complete challenges.' },
      { name: "User's own rank", description: "Highlights where the current user stands even if they're outside the visible top ranks." },
    ],
  },
  '/interview-prep': {
    title: 'Interview Prep',
    summary: 'A dedicated hub for practicing technical interviews with AI-generated questions and coding rounds.',
    modules: [
      { name: 'Onboarding', description: 'First-time setup asking the user which language and experience level to prepare for.' },
      { name: 'Quiz mode', description: 'AI-generated multiple-choice/conceptual interview questions.' },
      { name: 'Coding round', description: 'Live coding interview-style problems evaluated by the AI.' },
      { name: 'Simulated interview', description: 'A fuller mock-interview flow combining questions and code, with AI feedback at the end.' },
    ],
  },
  '/badges': {
    title: 'Badges',
    summary: 'Shows achievements and badges the user has unlocked through platform activity.',
    modules: [
      { name: 'Badge grid', description: 'All badges, with unlocked ones highlighted and locked ones shown as upcoming goals.' },
    ],
  },
  '/settings': {
    title: 'Settings',
    summary: "The user's account settings page.",
    modules: [
      { name: 'Profile settings', description: 'Update name, email, avatar, and other account details.' },
      { name: 'Preferences', description: 'App-level preferences such as theme.' },
    ],
  },
  '/ai-lab': {
    title: 'AI Lab',
    summary: 'A demo/tools page showcasing two AI workflow patterns beyond simple chat.',
    modules: [
      { name: 'Prompt Chaining tab', description: 'Enter a topic and watch a 3-step chained LLM workflow: summary → key points → quiz questions, each step feeding the next.' },
      { name: 'Agentic AI tab', description: 'Enter a task and watch a simple planner→executor agent break it into steps, execute each one, and produce a final consolidated result.' },
    ],
  },
};

// Builds the detailed page-context string injected into the chatbot's system prompt. Falls
// back to a generic description for any route not explicitly listed above (e.g. dynamic routes
// or pages added later that haven't been documented here yet).
export const getPageContext = (pathname: string): string => {
  if (pathname.startsWith('/challenge/')) {
    const id = pathname.split('/').pop();
    return `Page: Coding Challenge Workspace (ID: ${id}). The user is actively solving a specific coding challenge. Modules on this page: a problem description panel, a code editor, a run/submit console with test results, and (on some challenges) a visualizer panel for tracing execution. They might need hints, syntax help, or debugging assistance.`;
  }

  const info = PAGE_REGISTRY[pathname];
  if (!info) {
    return `User is on the "${pathname}" page of CodeGalaxy.`;
  }

  const moduleList = info.modules
    .map((m) => `  - ${m.name}: ${m.description}`)
    .join('\n');

  return `Page: ${info.title}. ${info.summary}\nModules/features visible on this page:\n${moduleList}\n\nIf the user asks you to explain "this page", "these modules", or similar, walk through the modules listed above in your own words, tailored to their question.`;
};
