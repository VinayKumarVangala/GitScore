// ─── Recommendation templates ─────────────────────────────────────────────────
// Each template is self-contained with title, description, steps, resources,
// and difficulty/impact metadata. Templates are selected by the generator and
// score-based modules.

export type Difficulty = "easy" | "medium" | "hard";
export type Category = "profile" | "documentation" | "activity" | "community" | "code-quality";

export interface RecommendationTemplate {
    id: string;
    category: Category;
    difficulty: Difficulty;
    /** Points this improvement could add if fully applied */
    maxImpact: number;
    title: string;
    description: string;
    steps: string[];
    resources: { label: string; url: string }[];
    /** Estimated minutes to complete */
    timeEstimate: number;
}

// ─── Profile templates ────────────────────────────────────────────────────────

export const PROFILE_README: RecommendationTemplate = {
    id: "profile-readme",
    category: "profile",
    difficulty: "easy",
    maxImpact: 4,
    title: "Create a Profile README",
    description: "A profile README is a special repository that appears at the top of your GitHub profile. It's your developer business card.",
    steps: [
        "Create a new public repository with the exact same name as your GitHub username.",
        "Add a README.md to that repository.",
        "Include sections: About Me, Tech Stack, Current Projects, Contact.",
        "Add GitHub stats badges using shields.io or github-readme-stats.",
        "Commit and push — it will appear on your profile instantly.",
    ],
    resources: [
        { label: "GitHub Docs: Profile README", url: "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme" },
        { label: "Awesome GitHub Profile READMEs", url: "https://github.com/abhisheknaiidu/awesome-github-profile-readme" },
        { label: "GitHub README Stats", url: "https://github.com/anuraghazra/github-readme-stats" },
    ],
    timeEstimate: 30,
};

export const IMPROVE_BIO: RecommendationTemplate = {
    id: "improve-bio",
    category: "profile",
    difficulty: "easy",
    maxImpact: 3,
    title: "Enhance Your GitHub Bio",
    description: "A detailed bio (60–120 chars) tells visitors who you are, what you do, and what you're passionate about.",
    steps: [
        "Go to Settings → Public profile.",
        "Write 1–2 sentences: your role, key technologies, and something unique.",
        "Example: '🚀 Full-stack dev | React · Next.js · Python | Building open-source tools'.",
        "Add emoji sparingly for visual interest.",
    ],
    resources: [
        { label: "Profile Settings", url: "https://github.com/settings/profile" },
    ],
    timeEstimate: 5,
};

export const ADD_WEBSITE: RecommendationTemplate = {
    id: "add-website",
    category: "profile",
    difficulty: "easy",
    maxImpact: 2,
    title: "Add a Portfolio / Website Link",
    description: "A personal website or portfolio link significantly increases recruiter trust and discoverability.",
    steps: [
        "If you don't have one, create a free portfolio on GitHub Pages, Netlify, or Vercel.",
        "Go to GitHub Settings → Public profile → Website.",
        "Paste your portfolio URL and save.",
    ],
    resources: [
        { label: "GitHub Pages", url: "https://pages.github.com" },
        { label: "Netlify Deploy", url: "https://www.netlify.com" },
    ],
    timeEstimate: 60,
};

export const PIN_REPOS: RecommendationTemplate = {
    id: "pin-repos",
    category: "profile",
    difficulty: "easy",
    maxImpact: 4,
    title: "Pin Your Best Repositories",
    description: "Pinned repos are the first thing visitors see. Showcase your best work with up to 6 pins.",
    steps: [
        "Go to your GitHub profile page.",
        "Click 'Customize your pins' below the profile info.",
        "Select up to 6 repositories that best represent your skills.",
        "Prioritise repos with: README, live demos, most stars, or unique concepts.",
    ],
    resources: [
        { label: "GitHub Docs: Pinning items", url: "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile" },
    ],
    timeEstimate: 5,
};

// ─── Documentation templates ──────────────────────────────────────────────────

export const IMPROVE_README: RecommendationTemplate = {
    id: "improve-readme",
    category: "documentation",
    difficulty: "medium",
    maxImpact: 8,
    title: "Improve Repository READMEs",
    description: "A great README turns a repo from invisible to starred. Aim for: title, description, installation, usage, screenshots, and license.",
    steps: [
        "Every repo should have a README.md.",
        "Include: project title, 1-line description, installation command, usage example.",
        "Add a screenshot or GIF for visual projects.",
        "Add badges (build status, version, license) from shields.io.",
        "Link to a live demo if available.",
    ],
    resources: [
        { label: "Art of README", url: "https://github.com/hackergrrl/art-of-readme" },
        { label: "Shields.io Badges", url: "https://shields.io" },
        { label: "README Template", url: "https://github.com/othneildrew/Best-README-Template" },
    ],
    timeEstimate: 45,
};

export const ADD_LICENSE: RecommendationTemplate = {
    id: "add-license",
    category: "documentation",
    difficulty: "easy",
    maxImpact: 5,
    title: "Add Licenses to Your Repositories",
    description: "Without a license, your code is technically 'all rights reserved'. MIT is the most permissive and widely used choice.",
    steps: [
        "Go to each repo without a license.",
        "Click 'Add file' → 'Create new file' → name it LICENSE.",
        "Click 'Choose a license template' and select MIT.",
        "Commit the license file.",
        "Alternatively, use GitHub's license picker when creating a new repo.",
    ],
    resources: [
        { label: "Choose a License", url: "https://choosealicense.com" },
        { label: "GitHub Docs: Licensing", url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository" },
    ],
    timeEstimate: 10,
};

export const ADD_TOPICS: RecommendationTemplate = {
    id: "add-topics",
    category: "documentation",
    difficulty: "easy",
    maxImpact: 3,
    title: "Add Topics to Repositories",
    description: "Topics make your repos discoverable in GitHub's search and explore pages.",
    steps: [
        "Go to each repository.",
        "Click the gear icon ⚙️ next to 'About'.",
        "Add 3–10 relevant topics (e.g., 'react', 'typescript', 'open-source').",
        "Use popular, specific terms over generic ones.",
    ],
    resources: [
        { label: "GitHub Topics", url: "https://github.com/topics" },
    ],
    timeEstimate: 10,
};

export const ADD_DESCRIPTIONS: RecommendationTemplate = {
    id: "add-descriptions",
    category: "documentation",
    difficulty: "easy",
    maxImpact: 4,
    title: "Add Repository Descriptions",
    description: "A one-line description helps visitors decide in < 2 seconds if your repo is relevant to them.",
    steps: [
        "Go to each repo without a description.",
        "Click the gear icon ⚙️ next to 'About'.",
        "Add a concise description (max 350 chars): what it does + main tech.",
    ],
    resources: [],
    timeEstimate: 15,
};

// ─── Activity templates ───────────────────────────────────────────────────────

export const BUILD_STREAK: RecommendationTemplate = {
    id: "build-streak",
    category: "activity",
    difficulty: "medium",
    maxImpact: 8,
    title: "Build a Consistent Commit Streak",
    description: "Consistency is more valuable than burst activity. Even one small commit a day compounds quickly.",
    steps: [
        "Set a daily reminder at the same time each day.",
        "Keep a list of small tasks: fix typos, improve docs, refactor one function.",
        "Use tools like 'Daily.dev' or GitHub's mobile app to stay in the flow.",
        "Track your progress with github-readme-streak-stats.",
    ],
    resources: [
        { label: "GitHub Streak Stats", url: "https://github-readme-streak-stats.herokuapp.com/" },
        { label: "Daily.dev", url: "https://daily.dev" },
    ],
    timeEstimate: 0, // ongoing
};

export const CONTRIBUTE_OSS: RecommendationTemplate = {
    id: "contribute-oss",
    category: "activity",
    difficulty: "medium",
    maxImpact: 7,
    title: "Open Pull Requests on Open-Source Projects",
    description: "Contributing to others' repos signals collaboration skills and boosts your community score.",
    steps: [
        "Find projects with 'good first issue' or 'help wanted' labels.",
        "Start small: fix typos, improve docs, or add a missing test.",
        "Read CONTRIBUTING.md before opening a PR.",
        "Be responsive to review feedback.",
    ],
    resources: [
        { label: "Good First Issues", url: "https://goodfirstissue.dev" },
        { label: "GitHub Explore", url: "https://github.com/explore" },
        { label: "First Contributions Guide", url: "https://github.com/firstcontributions/first-contributions" },
    ],
    timeEstimate: 120,
};

export const ENGAGE_ISSUES: RecommendationTemplate = {
    id: "engage-issues",
    category: "activity",
    difficulty: "easy",
    maxImpact: 5,
    title: "Engage with Issues and Discussions",
    description: "Commenting on issues and discussions counts as GitHub activity and builds your reputation.",
    steps: [
        "Star repos you use regularly and watch for new issues.",
        "Answer questions in issues of popular projects you know well.",
        "File detailed bug reports with reproducible steps.",
        "Use GitHub Discussions for longer-form conversations.",
    ],
    resources: [
        { label: "GitHub Discussions Docs", url: "https://docs.github.com/en/discussions" },
    ],
    timeEstimate: 20,
};

// ─── Community templates ──────────────────────────────────────────────────────

export const GROW_FOLLOWERS: RecommendationTemplate = {
    id: "grow-followers",
    category: "community",
    difficulty: "hard",
    maxImpact: 4,
    title: "Grow Your GitHub Followers",
    description: "Followers grow organically when you create valuable content, engage consistently, and make your work visible.",
    steps: [
        "Star and follow developers in your tech stack.",
        "Share your GitHub projects on Twitter / LinkedIn / dev.to.",
        "Write a blog post or tutorial linked to a real repo.",
        "Create a tool or template others will find useful.",
        "Contribute to popular projects — contributors gain visibility.",
    ],
    resources: [
        { label: "dev.to", url: "https://dev.to" },
        { label: "Hashnode", url: "https://hashnode.com" },
    ],
    timeEstimate: 0, // ongoing
};

export const CREATE_POPULAR_REPO: RecommendationTemplate = {
    id: "create-popular-repo",
    category: "community",
    difficulty: "hard",
    maxImpact: 5,
    title: "Build a Project People Want to Star",
    description: "Stars come from solving real problems. A well-documented utility, template, or tool can accumulate stars naturally.",
    steps: [
        "Identify a pain point you face in your daily development.",
        "Build a minimal but polished solution.",
        "Write excellent documentation with examples.",
        "Share on Hacker News 'Show HN', Reddit r/programming, and Twitter.",
        "Add to relevant 'awesome-*' lists via PR.",
    ],
    resources: [
        { label: "Hacker News Show HN", url: "https://news.ycombinator.com/show" },
        { label: "Awesome Lists", url: "https://github.com/sindresorhus/awesome" },
    ],
    timeEstimate: 0, // project
};

// ─── All templates array (for iteration) ─────────────────────────────────────

export const ALL_TEMPLATES: RecommendationTemplate[] = [
    PROFILE_README,
    IMPROVE_BIO,
    ADD_WEBSITE,
    PIN_REPOS,
    IMPROVE_README,
    ADD_LICENSE,
    ADD_TOPICS,
    ADD_DESCRIPTIONS,
    BUILD_STREAK,
    CONTRIBUTE_OSS,
    ENGAGE_ISSUES,
    GROW_FOLLOWERS,
    CREATE_POPULAR_REPO,
];
