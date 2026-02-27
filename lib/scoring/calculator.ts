// ─── Scoring calculator — combines all dimension scorers ──────────────────────
//
// Aggregates the four sub-module scores into a GitHubScorecard.
// Replaces the simpler lib/scoring.ts — this file is the new canonical engine.

import { GitHubUser, GitHubRepo, GitHubEvent, ContributionSummary, GitHubScorecard, PinnedRepo, ReadmeQuality, ScoreGrade, DetailedScorecard } from "@/lib/github/types";
import { scoreProfileCompleteness } from "./profile-completeness";
import { scoreCodeQuality } from "./code-quality";
import { scoreActivity } from "./activity";
import { scoreCommunity } from "./community";

// ─── Grade thresholds ─────────────────────────────────────────────────────────
// Max is 100 (20 + 30 + 35 + 15).

export function scoreToGrade(total: number): ScoreGrade {
    if (total >= 90) return "A+";
    if (total >= 80) return "A";
    if (total >= 70) return "B+";
    if (total >= 60) return "B";
    if (total >= 50) return "C+";
    if (total >= 40) return "C";
    if (total >= 25) return "D";
    return "F";
}

// ─── Recommendations generator ───────────────────────────────────────────────

interface AllResults {
    profile: ReturnType<typeof scoreProfileCompleteness>;
    codeQuality: ReturnType<typeof scoreCodeQuality>;
    activity: ReturnType<typeof scoreActivity>;
    community: ReturnType<typeof scoreCommunity>;
}

function buildHighlights(
    user: GitHubUser,
    results: AllResults,
    totalScore: number
): string[] {
    const tips: string[] = [];
    const { profile: p, codeQuality: q, activity: a, community: c } = results;

    // Positive highlights first
    if (a.breakdown.streak.value >= 30)
        tips.push(`🔥 ${a.breakdown.streak.value}-day streak! You are remarkably consistent.`);
    if (c.breakdown.totalStars.value >= 100)
        tips.push(`⭐ ${c.breakdown.totalStars.value} total stars — real open-source impact!`);
    if (totalScore >= 80)
        tips.push("🏆 Excellent GitHub profile. You're in the top tier of developers.");

    // Actionable improvements
    if (!p.breakdown.hasProfileReadme.value)
        tips.push("📖 Create a profile README (a repo named exactly your username) — it's worth 4 pts.");
    if (p.breakdown.bioQuality.pts < 2)
        tips.push("✍️ Expand your bio to at least 60 characters for a fuller profile impression.");
    if (!p.breakdown.hasWebsite.value)
        tips.push("🌐 Add a website or portfolio link to your GitHub profile.");
    if (q.breakdown.licenseCoverage.value < 50)
        tips.push("⚖️ Add open-source licenses to your repos — it boosts credibility and discoverability.");
    if (q.breakdown.topicsCoverage.value < 50)
        tips.push("🏷️ Add topics to your repos so they appear in GitHub's discovery pages.");
    if (q.breakdown.descCoverage.value < 70)
        tips.push("📝 Add short descriptions to repos without one.");
    if (a.breakdown.pullRequests.value < 5)
        tips.push("🔀 Contribute to open-source projects via pull requests to boost your activity score.");
    if (a.breakdown.commitFrequency.value < 3)
        tips.push("📅 Aim for at least 3 commits per week to improve your activity score.");
    if (c.breakdown.externalContrib.value < 5)
        tips.push("🤝 Contribute to other developers' projects to grow your community score.");

    // Deduplicate and cap at 5
    return Array.from(new Set(tips)).slice(0, 5);
}

// ─── Top languages (from raw repos, no language API needed) ──────────────────

function extractTopLanguages(
    repos: GitHubRepo[]
): { name: string; percentage: number }[] {
    const counts: Record<string, number> = {};
    const owned = repos.filter((r) => !r.fork && r.language);
    for (const r of owned) {
        counts[r.language!] = (counts[r.language!] ?? 0) + 1;
    }
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, n]) => ({ name, percentage: Math.round((n / total) * 1000) / 10 }));
}

// ─── Main export ─────────────────────────────────────────────────────────────

export interface ScorecardInput {
    user: GitHubUser;
    repos: GitHubRepo[];
    events: GitHubEvent[];
    contrib: ContributionSummary;
    pinned: PinnedRepo[];
    /** Keyed by repo.full_name */
    readmeMap?: Record<string, ReadmeQuality>;
}


export function calculateScorecard(input: ScorecardInput): DetailedScorecard {
    const { user, repos, events, contrib, pinned, readmeMap = {} } = input;

    const raw = {
        profile: scoreProfileCompleteness(user, repos, pinned),
        codeQuality: scoreCodeQuality(repos, readmeMap),
        activity: scoreActivity(contrib),
        community: scoreCommunity(user, repos, events),
    };

    const totalScore = Math.min(
        100,
        raw.profile.score + raw.codeQuality.score + raw.activity.score + raw.community.score
    );

    const grade = scoreToGrade(totalScore);

    // Map to ScoreDimension format expected by GitHubScorecard
    const dimensions: GitHubScorecard["dimensions"] = {
        activity: {
            label: "Activity",
            score: Math.round((raw.activity.score / raw.activity.maxScore) * 100),
            weight: 0.35,
            details: raw.activity.breakdown.commitFrequency.detail,
        },
        repositories: {
            label: "Code Quality",
            score: Math.round((raw.codeQuality.score / raw.codeQuality.maxScore) * 100),
            weight: 0.30,
            details: raw.codeQuality.breakdown.readmeCoverage.detail,
        },
        community: {
            label: "Community",
            score: Math.round((raw.community.score / raw.community.maxScore) * 100),
            weight: 0.15,
            details: raw.community.breakdown.totalStars.detail,
        },
        consistency: {
            label: "Profile",
            score: Math.round((raw.profile.score / raw.profile.maxScore) * 100),
            weight: 0.20,
            details: `${pinned.length} pinned repos · bio: ${user.bio ? "yes" : "missing"}`,
        },
        impact: {
            label: "Impact",
            score: Math.round(((raw.community.breakdown.totalStars.value > 0
                ? Math.min(100, Math.log2(raw.community.breakdown.totalStars.value + 1) * 16)
                : 0))),
            weight: 0,   // folded into community — kept for UI compatibility
            details: `${raw.community.breakdown.totalStars.value} stars · ${user.followers} followers`,
        },
    };

    const topLangs = extractTopLanguages(repos);
    const highlights = buildHighlights(user, raw, totalScore);

    return {
        username: user.login,
        fetchedAt: new Date().toISOString(),
        totalScore,
        grade,
        dimensions,
        topLanguages: topLangs,
        highlights,
        raw,
    };
}
