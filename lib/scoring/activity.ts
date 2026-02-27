// ─── Activity scorer — 35 pts total ─────────────────────────────────────────
//
// Measures how active a developer has been in the past 90 days, their
// contribution streak, and diversity of work types.

import { ContributionSummary } from "@/lib/github/types";

export interface ActivityResult {
    /** Score out of 35 */
    score: number;
    maxScore: 35;
    breakdown: ActivityBreakdown;
}

export interface ActivityBreakdown {
    commitFrequency: { value: number; pts: number; maxPts: 10; detail: string };
    pullRequests: { value: number; pts: number; maxPts: 7; detail: string };
    issueEngagement: { value: number; pts: number; maxPts: 5; detail: string };
    streak: { value: number; pts: number; maxPts: 8; detail: string };
    workDiversity: { value: number; pts: number; maxPts: 5; detail: string };
}

/** Active days in the last N calendar days from dailyActivity map. */
function activeDaysInWindow(
    daily: Record<string, number>,
    windowDays: number
): { activeDays: number; totalEvents: number } {
    const cutoff = Date.now() - windowDays * 86_400_000;
    let activeDays = 0, totalEvents = 0;
    for (const [dateStr, count] of Object.entries(daily)) {
        if (new Date(dateStr).getTime() >= cutoff) {
            activeDays++;
            totalEvents += count;
        }
    }
    return { activeDays, totalEvents };
}

/** How diverse is the work? Each unique event type = +1 (up to 5). */
function workDiversityScore(eventsByType: Record<string, number>): {
    diversity: number;
    types: string[];
} {
    // Bucket raw types into semantic work categories
    const categories = new Set<string>();
    const typeMap: Record<string, string> = {
        PushEvent: "commits",
        PullRequestEvent: "pull-requests",
        IssuesEvent: "issues",
        IssueCommentEvent: "communication",
        CommitCommentEvent: "communication",
        CreateEvent: "repository-work",
        ReleaseEvent: "releases",
        ForkEvent: "collaboration",
        WatchEvent: "collaboration",
    };
    for (const type of Object.keys(eventsByType)) {
        const category = typeMap[type] ?? "other";
        categories.add(category);
    }
    return { diversity: categories.size, types: Array.from(categories) };
}

export function scoreActivity(contrib: ContributionSummary): ActivityResult {
    const { activeDays: a90, totalEvents } = activeDaysInWindow(
        contrib.dailyActivity,
        90
    );
    const commitsPerWeek = Math.round((totalEvents / 13) * 10) / 10; // 90 days ≈ 13 wks

    // Commit frequency (0-10): log₂ scale — 1/wk=2pts, 5/wk=5pts, 20/wk=8pts, 50/wk≈10pts
    const commitPts = Math.min(10, Math.round(Math.log2(commitsPerWeek + 1) * 3.2));

    // Pull requests (0-7)
    const prPts = Math.min(7, Math.round(Math.log2(contrib.totalPRs + 1) * 2.5));

    // Issue engagement: issues + comments (0-5)
    const issueTotal = contrib.totalIssues + contrib.totalComments;
    const issuePts = Math.min(5, Math.round(Math.log2(issueTotal + 1) * 1.8));

    // Streak (0-8): recent streak weighted more
    const streakVal = contrib.recentStreak * 0.6 + contrib.longestStreak * 0.4;
    const streakPts = Math.min(8, Math.round(Math.sqrt(streakVal) * 1.3));

    // Work type diversity (0-5)
    const { diversity, types } = workDiversityScore(contrib.eventsByType);
    const divPts = Math.min(5, diversity);

    const breakdown: ActivityBreakdown = {
        commitFrequency: {
            value: commitsPerWeek,
            pts: commitPts,
            maxPts: 10,
            detail: `~${commitsPerWeek} commits/wk · ${a90} active days in 90d`,
        },
        pullRequests: {
            value: contrib.totalPRs,
            pts: prPts,
            maxPts: 7,
            detail: `${contrib.totalPRs} PRs opened`,
        },
        issueEngagement: {
            value: issueTotal,
            pts: issuePts,
            maxPts: 5,
            detail: `${contrib.totalIssues} issues + ${contrib.totalComments} comments`,
        },
        streak: {
            value: contrib.longestStreak,
            pts: streakPts,
            maxPts: 8,
            detail: `${contrib.longestStreak}-day max · ${contrib.recentStreak}-day recent streak`,
        },
        workDiversity: {
            value: diversity,
            pts: divPts,
            maxPts: 5,
            detail: `${types.join(", ")}`,
        },
    };

    const score = Math.min(35, Object.values(breakdown).reduce((s, b) => s + b.pts, 0));
    return { score, maxScore: 35, breakdown };
}
