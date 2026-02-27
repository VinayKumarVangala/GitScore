import { GitHubRepo, LanguageMap, ReadmeQuality, ScoreGrade } from "./types";
import { scoreToGrade as calculatorScoreToGrade } from "../scoring/calculator";

// ─── Language parsing ─────────────────────────────────────────────────────────

/**
 * Merge multiple per-repo language maps into a single sorted aggregate
 * and return percentage breakdown.
 */
export function aggregateLanguages(
    maps: LanguageMap[]
): { name: string; bytes: number; percentage: number }[] {
    const totals: Record<string, number> = {};
    for (const map of maps) {
        for (const [lang, bytes] of Object.entries(map)) {
            totals[lang] = (totals[lang] ?? 0) + bytes;
        }
    }

    const grandTotal = Object.values(totals).reduce((s, b) => s + b, 0) || 1;

    return Object.entries(totals)
        .map(([name, bytes]) => ({
            name,
            bytes,
            percentage: Math.round((bytes / grandTotal) * 1000) / 10,
        }))
        .sort((a, b) => b.bytes - a.bytes);
}

/**
 * Return top-N languages suitable for the scorecard header.
 */
export function topLanguages(
    maps: LanguageMap[],
    n = 5
): { name: string; percentage: number }[] {
    return aggregateLanguages(maps).slice(0, n).map(({ name, percentage }) => ({
        name,
        percentage,
    }));
}

// ─── README quality analysis ─────────────────────────────────────────────────

export function analyseReadme(content: string | null): ReadmeQuality {
    if (!content) {
        return {
            exists: false,
            length: 0,
            hasTitle: false,
            hasBadges: false,
            hasImages: false,
            hasCodeBlocks: false,
            hasLinks: false,
            sectionCount: 0,
            score: 0,
        };
    }

    const hasTitle = /^#{1,2}\s+\S+/m.test(content);
    const hasBadges = /!\[.*?\]\(https?:\/\/.*?(badge|shield|img\.shields)/i.test(content);
    const hasImages = /!\[.*?\]\(https?:\/\//i.test(content);
    const hasCodeBlocks = /```[\s\S]*?```/.test(content);
    const hasLinks = /\[.+?\]\(https?:\/\/.+?\)/.test(content);
    const sectionCount = (content.match(/^#{2,4}\s+\S+/gm) ?? []).length;

    let score = 0;
    if (content.length > 200) score += 15;
    if (content.length > 800) score += 10;
    if (content.length > 2000) score += 10;
    if (hasTitle) score += 15;
    if (hasBadges) score += 10;
    if (hasImages) score += 10;
    if (hasCodeBlocks) score += 15;
    if (hasLinks) score += 10;
    if (sectionCount >= 2) score += 5;
    if (sectionCount >= 4) score += 5;

    return {
        exists: true,
        length: content.length,
        hasTitle,
        hasBadges,
        hasImages,
        hasCodeBlocks,
        hasLinks,
        sectionCount,
        score: Math.min(100, score),
    };
}

// ─── Repository activity score ────────────────────────────────────────────────

/** Score 0–100 reflecting how recently and actively a repo is maintained. */
export function repoActivityScore(repo: GitHubRepo): number {
    const now = Date.now();
    const pushedAgo = (now - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24); // days

    let score = 0;

    // Recency (up to 40 pts)
    if (pushedAgo < 7) score += 40;
    else if (pushedAgo < 30) score += 30;
    else if (pushedAgo < 90) score += 20;
    else if (pushedAgo < 365) score += 10;

    // Community signals (up to 35 pts)
    score += Math.min(20, Math.log2(repo.stargazers_count + 1) * 3);
    score += Math.min(10, Math.log2(repo.forks_count + 1) * 2);
    score += Math.min(5, repo.open_issues_count > 0 ? 5 : 0);

    // Documentation / quality (up to 25 pts)
    if (repo.description) score += 5;
    if (repo.homepage) score += 3;
    if (repo.topics.length > 0) score += 5;
    if (repo.license) score += 5;
    if (repo.has_wiki) score += 3;
    if (repo.has_pages) score += 4;

    return Math.min(100, Math.round(score));
}

// ─── Contribution frequency ───────────────────────────────────────────────────

export interface ContribFrequency {
    commitsPerWeek: number;
    activeDaysPerMonth: number;
    consistencyScore: number;    // 0–100
}

export function calcContribFrequency(
    dailyActivity: Record<string, number>
): ContribFrequency {
    const days = Object.keys(dailyActivity);
    if (!days.length) return { commitsPerWeek: 0, activeDaysPerMonth: 0, consistencyScore: 0 };

    const oldest = new Date(days[0]);
    const newest = new Date(days[days.length - 1]);
    const totalWeeks = Math.max(1, (newest.getTime() - oldest.getTime()) / (7 * 86_400_000));

    const totalEvents = Object.values(dailyActivity).reduce((s, v) => s + v, 0);
    const commitsPerWeek = Math.round((totalEvents / totalWeeks) * 10) / 10;

    // active days in last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const activeDaysPerMonth = days.filter((d) => new Date(d) >= cutoff).length;

    // consistency: what fraction of weeks in the period had any activity?
    const activeWeeks = new Set<string>();
    for (const d of days) {
        const dt = new Date(d);
        const weekStart = new Date(dt);
        weekStart.setDate(dt.getDate() - dt.getDay());
        activeWeeks.add(weekStart.toISOString().slice(0, 10));
    }
    const consistencyScore = Math.round(
        Math.min(100, (activeWeeks.size / totalWeeks) * 100)
    );

    return { commitsPerWeek, activeDaysPerMonth, consistencyScore };
}

// ─── Grade from score ─────────────────────────────────────────────────────────

export const scoreToGrade = calculatorScoreToGrade;

// ─── Format API response for scoring ─────────────────────────────────────────

export function formatReposForScoring(repos: GitHubRepo[]): {
    ownedCount: number;
    totalStars: number;
    totalForks: number;
    avgActivityScore: number;
    languageCount: number;
} {
    const ownedRepos = repos.filter((r) => !r.fork && !r.archived);

    const totalStars = ownedRepos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = ownedRepos.reduce((s, r) => s + r.forks_count, 0);
    const scores = ownedRepos.map(repoActivityScore);
    const avgActivityScore = scores.length
        ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
        : 0;

    const langSet = new Set<string>(
        ownedRepos.map((r) => r.language).filter(Boolean) as string[]
    );

    return {
        ownedCount: ownedRepos.length,
        totalStars,
        totalForks,
        avgActivityScore,
        languageCount: langSet.size,
    };
}
