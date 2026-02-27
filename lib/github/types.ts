// ─── TypeScript interfaces for GitHub API responses ────────────────────────

/* ── User ─────────────────────────────────────────────────────────────────── */
export interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    name: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    email: string | null;
    bio: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
    hireable: boolean | null;
    twitter_username: string | null;
}

/* ── Repository ───────────────────────────────────────────────────────────── */
export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    fork: boolean;
    stargazers_count: number;
    watchers_count: number;
    forks_count: number;
    open_issues_count: number;
    language: string | null;
    topics: string[];
    size: number;                    // kilobytes
    has_wiki: boolean;
    has_pages: boolean;
    license: { spdx_id: string; name: string } | null;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    default_branch: string;
    visibility: "public" | "private";
    archived: boolean;
    disabled: boolean;
    homepage: string | null;
}

/* ── Language breakdown ───────────────────────────────────────────────────── */
export type LanguageMap = Record<string, number>;   // { TypeScript: 34000, … }

/* ── Events ───────────────────────────────────────────────────────────────── */
export type GitHubEventType =
    | "PushEvent"
    | "PullRequestEvent"
    | "IssuesEvent"
    | "IssueCommentEvent"
    | "CreateEvent"
    | "ForkEvent"
    | "WatchEvent"
    | "ReleaseEvent"
    | "CommitCommentEvent"
    | "DeleteEvent"
    | string;

export interface GitHubEvent {
    id: string;
    type: GitHubEventType;
    actor: { login: string; avatar_url: string };
    repo: { id: number; name: string; url: string };
    created_at: string;
    payload: Record<string, unknown>;
}

/* ── Contribution activity summary ───────────────────────────────────────── */
export interface ContributionSummary {
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    totalComments: number;
    activeDays: number;          // unique days with any event
    longestStreak: number;       // days (approximation from events)
    recentStreak: number;
    eventsByType: Record<GitHubEventType, number>;
    dailyActivity: Record<string, number>; // "YYYY-MM-DD" → count
}

/* ── Pinned repo (from GraphQL / REST fallback) ───────────────────────────── */
export interface PinnedRepo {
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
}

/* ── Processed repo for scoring ──────────────────────────────────────────── */
export interface ProcessedRepo extends GitHubRepo {
    languages: LanguageMap;
    readmeQuality: ReadmeQuality;
    activityScore: number;      // 0–100 freshness metric
}

/* ── README quality metrics ────────────────────────────────────────────────── */
export interface ReadmeQuality {
    exists: boolean;
    length: number;             // character count
    hasTitle: boolean;
    hasBadges: boolean;
    hasImages: boolean;
    hasCodeBlocks: boolean;
    hasLinks: boolean;
    sectionCount: number;       // ## headings
    score: number;              // 0–100
}

/* ── Score card ────────────────────────────────────────────────────────────── */
export type ScoreGrade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";

export interface ScoreDimension {
    label: string;
    score: number;    // 0–100
    weight: number;   // fraction of total (sums to 1)
    details: string;
}

export interface GitHubScorecard {
    username: string;
    fetchedAt: string;          // ISO timestamp
    totalScore: number;         // 0–100
    grade: ScoreGrade;
    dimensions: {
        activity: ScoreDimension;
        repositories: ScoreDimension;
        community: ScoreDimension;
        consistency: ScoreDimension;
        impact: ScoreDimension;
    };
    topLanguages: { name: string; percentage: number }[];
    highlights: string[];       // human-readable insights
}

/* ── Detailed results for UI ─────────────────────────────────────────────── */

export interface ScoringSubResult<T = any> {
    score: number;
    maxScore: number;
    breakdown: T;
}

export interface DetailedScorecard extends GitHubScorecard {
    raw: {
        profile: ScoringSubResult;
        codeQuality: ScoringSubResult;
        activity: ScoringSubResult;
        community: ScoringSubResult;
    };
}

/* ── API rate limit state ────────────────────────────────────────────────── */
export interface RateLimitState {
    limit: number;
    remaining: number;
    reset: Date;
    used: number;
}
