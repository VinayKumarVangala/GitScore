// ─── Community scorer — 15 pts total ────────────────────────────────────────
//
// Measures the developer's impact and reach in the GitHub community.
// All metrics use log₂ scaling so outliers don't eclipse mid-range developers.

import { GitHubUser, GitHubRepo, GitHubEvent } from "@/lib/github/types";

export interface CommunityResult {
    /** Score out of 15 */
    score: number;
    maxScore: 15;
    breakdown: CommunityBreakdown;
}

export interface CommunityBreakdown {
    totalStars: { value: number; pts: number; maxPts: 5; detail: string };
    totalForks: { value: number; pts: number; maxPts: 3; detail: string };
    followerScore: { value: number; pts: number; maxPts: 4; detail: string };
    externalContrib: { value: number; pts: number; maxPts: 3; detail: string };
}

/**
 * Count events (PushEvent, PullRequestEvent) targeting repos not owned by
 * the user — i.e. contributions to others' repos.
 */
function countExternalContributions(
    username: string,
    events: GitHubEvent[]
): number {
    const externalTypes = new Set(["PushEvent", "PullRequestEvent", "IssueCommentEvent"]);
    return events.filter((e) => {
        if (!externalTypes.has(e.type)) return false;
        // repo.name is "owner/repo"
        const owner = (e.repo?.name ?? "").split("/")[0];
        return owner.toLowerCase() !== username.toLowerCase();
    }).length;
}

export function scoreCommunity(
    user: GitHubUser,
    repos: GitHubRepo[],
    events: GitHubEvent[]
): CommunityResult {
    const ownedRepos = repos.filter((r) => !r.fork && !r.archived);

    const totalStars = ownedRepos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = ownedRepos.reduce((s, r) => s + r.forks_count, 0);
    const followers = user.followers;

    // Stars (0-5): log₂ scale — 1★=0, 10★=1.4, 100★=2.7, 1k★=3.9, 10k★=4.8
    const starPts = Math.min(5, Math.round(Math.log2(totalStars + 1) * 0.95));

    // Forks (0-3)
    const forkPts = Math.min(3, Math.round(Math.log2(totalForks + 1) * 0.75));

    // Followers (0-4): 1→0, 10→1.3, 100→2.6, 1k→4
    const followerPts = Math.min(4, Math.round(Math.log2(followers + 1) * 0.8));

    // External contributions (0-3)
    const extCount = countExternalContributions(user.login, events);
    const extPts = Math.min(3, Math.round(Math.log2(extCount + 1)));

    const breakdown: CommunityBreakdown = {
        totalStars: { value: totalStars, pts: starPts, maxPts: 5, detail: `${totalStars} total stars across owned repos` },
        totalForks: { value: totalForks, pts: forkPts, maxPts: 3, detail: `${totalForks} total forks` },
        followerScore: { value: followers, pts: followerPts, maxPts: 4, detail: `${followers} followers` },
        externalContrib: { value: extCount, pts: extPts, maxPts: 3, detail: `${extCount} contributions to others' repos` },
    };

    const score = Math.min(15, Object.values(breakdown).reduce((s, b) => s + b.pts, 0));
    return { score, maxScore: 15, breakdown };
}
