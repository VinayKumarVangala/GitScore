// ─── Scoring engine ───────────────────────────────────────────────────────────
// Pure function that takes pre-fetched GitHub data and returns a GitHubScorecard.

import {
    GitHubUser,
    GitHubRepo,
    ContributionSummary,
    GitHubScorecard,
    ScoreDimension,
    ScoreGrade,
} from "@/lib/github/types";
import {
    formatReposForScoring,
    calcContribFrequency,
    scoreToGrade,
    topLanguages,
} from "@/lib/github/utils";

// ─── Dimension calculators ───────────────────────────────────────────────────

function activityScore(
    contrib: ContributionSummary,
    _repos: GitHubRepo[]
): ScoreDimension {
    const { commitsPerWeek, activeDaysPerMonth, consistencyScore } =
        calcContribFrequency(contrib.dailyActivity);

    // 100 pts total
    let score = 0;
    score += Math.min(30, Math.log2(commitsPerWeek + 1) * 10);   // commits/wk  (0-30)
    score += Math.min(20, activeDaysPerMonth * (20 / 30));          // active days (0-20)
    score += (consistencyScore / 100) * 20;                         // consistency (0-20)
    score += Math.min(15, contrib.longestStreak * 0.5);             // streak      (0-15)
    score += Math.min(10, contrib.totalPRs * 0.5);              // PRs         (0-10)
    score += Math.min(5, contrib.totalIssues * 0.25);             // issues      (0-5)

    const final = Math.min(100, Math.round(score));
    return {
        label: "Activity",
        score: final,
        weight: 0.25,
        details: `${commitsPerWeek} commits/wk · ${activeDaysPerMonth} active days last month · ${contrib.longestStreak}-day streak`,
    };
}

function repositoriesScore(repos: GitHubRepo[]): ScoreDimension {
    const {
        ownedCount,
        totalStars,
        totalForks,
        avgActivityScore,
        languageCount,
    } = formatReposForScoring(repos);

    let score = 0;
    score += Math.min(20, Math.log2(ownedCount + 1) * 5);     // repo count    (0-20)
    score += Math.min(30, Math.log2(totalStars + 1) * 6);     // stars         (0-30)
    score += Math.min(15, Math.log2(totalForks + 1) * 4);     // forks         (0-15)
    score += (avgActivityScore / 100) * 20;                       // avg freshness (0-20)
    score += Math.min(15, languageCount * 3);                     // polyglot      (0-15)

    const final = Math.min(100, Math.round(score));
    return {
        label: "Repositories",
        score: final,
        weight: 0.25,
        details: `${ownedCount} repos · ${totalStars} stars · ${languageCount} languages`,
    };
}

function communityScore(user: GitHubUser, contrib: ContributionSummary): ScoreDimension {
    let score = 0;
    score += Math.min(30, Math.log2(user.followers + 1) * 6);   // followers  (0-30)
    score += Math.min(10, Math.log2(user.following + 1) * 3);   // following  (0-10)
    score += Math.min(20, contrib.totalPRs * 1.5);            // PRs        (0-20)
    score += Math.min(20, contrib.totalIssues * 1.0);            // issues     (0-20)
    score += Math.min(20, contrib.totalComments * 0.5);            // comments   (0-20)

    const final = Math.min(100, Math.round(score));
    return {
        label: "Community",
        score: final,
        weight: 0.2,
        details: `${user.followers} followers · ${contrib.totalPRs} PRs · ${contrib.totalIssues} issues`,
    };
}

function consistencyScore(contrib: ContributionSummary): ScoreDimension {
    const { consistencyScore: cs } =
        calcContribFrequency(contrib.dailyActivity);

    let score = 0;
    score += cs * 0.5;                                             // weekly consistency (0-50)
    score += Math.min(30, contrib.longestStreak);                  // longest streak     (0-30)
    score += Math.min(20, contrib.recentStreak * 2);             // recent streak      (0-20)

    const final = Math.min(100, Math.round(score));
    return {
        label: "Consistency",
        score: final,
        weight: 0.15,
        details: `${contrib.longestStreak}-day longest streak · ${contrib.recentStreak}-day recent streak`,
    };
}

function impactScore(
    user: GitHubUser,
    repos: GitHubRepo[]
): ScoreDimension {
    const ownedRepos = repos.filter((r) => !r.fork && !r.archived);
    const totalStars = ownedRepos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = ownedRepos.reduce((s, r) => s + r.forks_count, 0);
    const hasWebsite = !!user.blog;
    const hasTwitter = !!user.twitter_username;

    let score = 0;
    score += Math.min(40, Math.log2(totalStars + 1) * 7);         // stars       (0-40)
    score += Math.min(20, Math.log2(totalForks + 1) * 5);         // forks       (0-20)
    score += Math.min(20, Math.log2(user.followers + 1) * 5);   // followers   (0-20)
    score += hasWebsite ? 10 : 0;                                  // website     (0-10)
    score += hasTwitter ? 5 : 0;                                  // twitter     (0-5)
    score += user.email ? 5 : 0;                                  // contact     (0-5)

    const final = Math.min(100, Math.round(score));
    return {
        label: "Impact",
        score: final,
        weight: 0.15,
        details: `${totalStars} total stars · ${user.followers} followers`,
    };
}

// ─── Recommendations ─────────────────────────────────────────────────────────

function generateHighlights(
    user: GitHubUser,
    repos: GitHubRepo[],
    contrib: ContributionSummary,
    scorecard: Omit<GitHubScorecard, "highlights">
): string[] {
    const tips: string[] = [];
    const { dimensions: d } = scorecard;

    if (d.activity.score < 40)
        tips.push("📅 Commit more regularly — even small daily contributions boost your activity score significantly.");
    if (d.repositories.score < 40)
        tips.push("🗂️ Add descriptions, topics, and licenses to your repos for an instant quality boost.");
    if (!user.bio)
        tips.push("✍️ Add a GitHub bio — it increases your profile's discoverability.");
    if (user.followers < 10)
        tips.push("🤝 Engage with the community by following developers in your tech stack.");
    if (d.consistency.score < 50)
        tips.push("🔥 Build a streak — try to commit at least 3 times a week.");
    if (contrib.totalPRs < 5)
        tips.push("🔀 Open pull requests on open-source projects to grow your community score.");

    // Positive highlights
    if (d.impact.score >= 70)
        tips.push("⭐ Your repos are highly starred! You have real open-source impact.");
    if (d.consistency.score >= 80)
        tips.push("🏆 Incredible consistency — your streak shows true dedication.");
    if (d.activity.score >= 80)
        tips.push("🚀 You're extremely active on GitHub. Keep it up!");

    return tips.slice(0, 5);
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function buildScorecard(
    user: GitHubUser,
    repos: GitHubRepo[],
    contrib: ContributionSummary
): GitHubScorecard {
    const dimensions = {
        activity: activityScore(contrib, repos),
        repositories: repositoriesScore(repos),
        community: communityScore(user, contrib),
        consistency: consistencyScore(contrib),
        impact: impactScore(user, repos),
    };

    const totalScore = Math.round(
        Object.values(dimensions).reduce(
            (sum, dim) => sum + dim.score * dim.weight,
            0
        )
    );

    const grade: ScoreGrade = scoreToGrade(totalScore);

    const langMaps = repos
        .filter((r) => !r.fork && r.language)
        .reduce<Record<string, number>>((acc, r) => {
            // Approximate bytes by counting repos per language
            acc[r.language!] = (acc[r.language!] ?? 0) + 1;
            return acc;
        }, {});

    const langs = topLanguages([langMaps], 6);

    const partial: Omit<GitHubScorecard, "highlights"> = {
        username: user.login,
        fetchedAt: new Date().toISOString(),
        totalScore,
        grade,
        dimensions,
        topLanguages: langs,
    };

    return {
        ...partial,
        highlights: generateHighlights(user, repos, contrib, partial),
    };
}
