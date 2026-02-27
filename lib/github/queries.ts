import { getOctokit, withRetry, parallel, toGitHubApiError } from "./client";
import {
    GitHubUser,
    GitHubRepo,
    GitHubEvent,
    LanguageMap,
    ContributionSummary,
    PinnedRepo,
} from "./types";

// ─── User profile ─────────────────────────────────────────────────────────────

export async function fetchUserProfile(username: string): Promise<GitHubUser> {
    const octokit = getOctokit();
    try {
        const { data } = await withRetry(() =>
            octokit.rest.users.getByUsername({ username })
        );
        return data as GitHubUser;
    } catch (err) {
        throw toGitHubApiError(err);
    }
}

// ─── User repositories ────────────────────────────────────────────────────────

export async function fetchUserRepos(
    username: string,
    page = 1,
    perPage = 100
): Promise<GitHubRepo[]> {
    const octokit = getOctokit();
    try {
        const { data } = await withRetry(() =>
            octokit.rest.repos.listForUser({
                username,
                sort: "updated",
                direction: "desc",
                type: "owner",
                per_page: perPage,
                page,
            })
        );
        return data as GitHubRepo[];
    } catch (err) {
        throw toGitHubApiError(err);
    }
}

/** Fetch ALL public repos (multi-page) up to a maximum count. */
export async function fetchAllUserRepos(
    username: string,
    maxRepos = 500
): Promise<GitHubRepo[]> {
    const perPage = 100;
    const pages = Math.ceil(maxRepos / perPage);

    const tasks = Array.from({ length: pages }, (_, i) => () =>
        fetchUserRepos(username, i + 1, perPage)
    );
    const pages_data = await parallel(tasks, 3);

    return pages_data.flat().slice(0, maxRepos).filter(
        (r) => !r.fork && !r.archived && !r.disabled
    );
}

// ─── Repository languages ─────────────────────────────────────────────────────

export async function fetchRepoLanguages(
    owner: string,
    repo: string
): Promise<LanguageMap> {
    const octokit = getOctokit();
    try {
        const { data } = await withRetry(() =>
            octokit.rest.repos.listLanguages({ owner, repo })
        );
        return data as LanguageMap;
    } catch {
        return {};
    }
}

// ─── User events (public activity) ───────────────────────────────────────────

export async function fetchUserEvents(
    username: string,
    page = 1
): Promise<GitHubEvent[]> {
    const octokit = getOctokit();
    try {
        const { data } = await withRetry(() =>
            octokit.rest.activity.listPublicEventsForUser({
                username,
                per_page: 100,
                page,
            })
        );
        return data as GitHubEvent[];
    } catch (err) {
        throw toGitHubApiError(err);
    }
}

/** Fetch up to 3 pages of events (max 300) in parallel. */
export async function fetchAllUserEvents(username: string): Promise<GitHubEvent[]> {
    const tasks = [1, 2, 3].map((page) => () => fetchUserEvents(username, page));
    const pages = await parallel(tasks, 3);
    return pages.flat();
}

// ─── Contribution summary from events ────────────────────────────────────────

export async function fetchContributions(username: string): Promise<ContributionSummary> {
    const events = await fetchAllUserEvents(username);
    return summariseEvents(events);
}

function summariseEvents(events: GitHubEvent[]): ContributionSummary {
    const eventsByType: Record<string, number> = {};
    const dailyActivity: Record<string, number> = {};
    let totalCommits = 0;
    let totalPRs = 0;
    let totalIssues = 0;
    let totalComments = 0;

    for (const ev of events) {
        const type = ev.type ?? "Unknown";
        eventsByType[type] = (eventsByType[type] ?? 0) + 1;

        const day = ev.created_at.slice(0, 10);
        dailyActivity[day] = (dailyActivity[day] ?? 0) + 1;

        if (type === "PushEvent") {
            const commits = (ev.payload as any)?.commits?.length ?? 1;
            totalCommits += commits;
        } else if (type === "PullRequestEvent") totalPRs++;
        else if (type === "IssuesEvent") totalIssues++;
        else if (type === "IssueCommentEvent" || type === "CommitCommentEvent") totalComments++;
    }

    const sortedDays = Object.keys(dailyActivity).sort();
    const { longestStreak, recentStreak } = calcStreaks(sortedDays);

    return {
        totalCommits,
        totalPRs,
        totalIssues,
        totalComments,
        activeDays: sortedDays.length,
        longestStreak,
        recentStreak,
        eventsByType,
        dailyActivity,
    };
}

function calcStreaks(sortedDays: string[]): { longestStreak: number; recentStreak: number } {
    if (!sortedDays.length) return { longestStreak: 0, recentStreak: 0 };

    let longest = 1, current = 1;
    for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1]);
        const curr = new Date(sortedDays[i]);
        const diffDays = (curr.getTime() - prev.getTime()) / 86_400_000;
        if (diffDays === 1) { current++; longest = Math.max(longest, current); }
        else current = 1;
    }

    // Recent streak — count backwards from today
    const today = new Date();
    let recentStreak = 0;
    for (let d = 0; d <= 90; d++) {
        const check = new Date(today);
        check.setDate(today.getDate() - d);
        const key = check.toISOString().slice(0, 10);
        if (dailyHas(sortedDays, key)) recentStreak++;
        else if (d > 1) break;   // gap — stop (allow 1-day grace from today)
    }

    return { longestStreak: longest, recentStreak };
}

function dailyHas(sortedDays: string[], key: string): boolean {
    return sortedDays.includes(key);
}

// ─── README content ──────────────────────────────────────────────────────────

export async function fetchReadmeContent(
    owner: string,
    repo: string
): Promise<string | null> {
    const octokit = getOctokit();
    try {
        const { data } = await octokit.rest.repos.getReadme({ owner, repo });
        if (!("content" in data)) return null;
        return Buffer.from(data.content, "base64").toString("utf-8");
    } catch {
        return null;                // 404 is totally normal
    }
}

// ─── Pinned repos (best-effort REST fallback) ─────────────────────────────────
//
// GitHub's pinned repos are only accessible via GraphQL with a user token.
// Without one, we return the 6 most-starred non-fork repos as a proxy.

export async function fetchPinnedRepos(username: string): Promise<PinnedRepo[]> {
    try {
        const repos = await fetchUserRepos(username, 1, 100);
        return repos
            .filter((r) => !r.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6)
            .map((r) => ({
                name: r.name,
                full_name: r.full_name,
                description: r.description,
                html_url: r.html_url,
                stargazers_count: r.stargazers_count,
                forks_count: r.forks_count,
                language: r.language,
            }));
    } catch {
        return [];
    }
}
