// ─── Code quality scorer — 30 pts total ─────────────────────────────────────
//
// Analyses repository hygiene signals across all owned repos.

import { GitHubRepo, ReadmeQuality } from "@/lib/github/types";

export interface CodeQualityResult {
    /** Score out of 30 */
    score: number;
    maxScore: 30;
    breakdown: CodeQualityBreakdown;
}

export interface CodeQualityBreakdown {
    readmeCoverage: { value: number; pts: number; maxPts: 8; detail: string };
    licenseCoverage: { value: number; pts: number; maxPts: 5; detail: string };
    descCoverage: { value: number; pts: number; maxPts: 4; detail: string };
    topicsCoverage: { value: number; pts: number; maxPts: 3; detail: string };
    languageDiversity: { value: number; pts: number; maxPts: 5; detail: string };
    staleRatio: { value: number; pts: number; maxPts: 3; detail: string };
    namingConsistency: { value: number; pts: number; maxPts: 2; detail: string };
}

/** Fraction of strings that match kebab-case or snake_case naming. */
function namingScore(names: string[]): number {
    if (!names.length) return 0;
    const kebab = names.filter((n) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(n)).length;
    const snake = names.filter((n) => /^[a-z0-9]+(_[a-z0-9]+)*$/.test(n)).length;
    return Math.round((Math.max(kebab, snake) / names.length) * 100);
}

/** Ratio of repos pushed longer than N days ago. */
function staleRatio(repos: GitHubRepo[], thresholdDays = 365): number {
    if (!repos.length) return 0;
    const cutoffMs = Date.now() - thresholdDays * 86_400_000;
    const stale = repos.filter((r) => new Date(r.pushed_at).getTime() < cutoffMs).length;
    return Math.round((stale / repos.length) * 100);
}

export function scoreCodeQuality(
    repos: GitHubRepo[],
    /** Per-repo README results keyed by full_name */
    readmeMap: Record<string, ReadmeQuality>
): CodeQualityResult {
    const owned = repos.filter((r) => !r.fork && !r.archived && !r.disabled);
    if (!owned.length) {
        return {
            score: 0,
            maxScore: 30,
            breakdown: {
                readmeCoverage: { value: 0, pts: 0, maxPts: 8, detail: "No owned repos" },
                licenseCoverage: { value: 0, pts: 0, maxPts: 5, detail: "No owned repos" },
                descCoverage: { value: 0, pts: 0, maxPts: 4, detail: "No owned repos" },
                topicsCoverage: { value: 0, pts: 0, maxPts: 3, detail: "No owned repos" },
                languageDiversity: { value: 0, pts: 0, maxPts: 5, detail: "No owned repos" },
                staleRatio: { value: 0, pts: 0, maxPts: 3, detail: "No owned repos" },
                namingConsistency: { value: 0, pts: 0, maxPts: 2, detail: "No owned repos" },
            },
        };
    }

    // README coverage (% of repos with good README)
    const readmeScores = owned.map((r) => readmeMap[r.full_name]?.score ?? 0);
    const avgReadme = readmeScores.reduce((s, v) => s + v, 0) / readmeScores.length;
    const readmePts = Math.round((avgReadme / 100) * 8);

    // License coverage
    const licenseCount = owned.filter((r) => !!r.license).length;
    const licensePct = Math.round((licenseCount / owned.length) * 100);
    const licensePts = Math.round((licensePct / 100) * 5);

    // Description coverage
    const descCount = owned.filter((r) => !!r.description?.trim()).length;
    const descPct = Math.round((descCount / owned.length) * 100);
    const descPts = Math.round((descPct / 100) * 4);

    // Topics coverage
    const topicsCount = owned.filter((r) => r.topics.length > 0).length;
    const topicsPct = Math.round((topicsCount / owned.length) * 100);
    const topicsPts = Math.round((topicsPct / 100) * 3);

    // Language diversity
    const langSet = new Set(owned.map((r) => r.language).filter(Boolean));
    const langPts = Math.min(5, Math.floor(langSet.size * 0.6));

    // Stale ratio (lower stale = better)
    const stalePct = staleRatio(owned);
    const stalePts = stalePct < 10 ? 3 : stalePct < 30 ? 2 : stalePct < 50 ? 1 : 0;

    // Naming consistency
    const names = owned.map((r) => r.name);
    const namePct = namingScore(names);
    const namePts = namePct >= 80 ? 2 : namePct >= 50 ? 1 : 0;

    const breakdown: CodeQualityBreakdown = {
        readmeCoverage: { value: Math.round(avgReadme), pts: readmePts, maxPts: 8, detail: `avg README quality ${Math.round(avgReadme)}/100` },
        licenseCoverage: { value: licensePct, pts: licensePts, maxPts: 5, detail: `${licenseCount}/${owned.length} repos licensed` },
        descCoverage: { value: descPct, pts: descPts, maxPts: 4, detail: `${descCount}/${owned.length} repos have descriptions` },
        topicsCoverage: { value: topicsPct, pts: topicsPts, maxPts: 3, detail: `${topicsCount}/${owned.length} repos have topics` },
        languageDiversity: { value: langSet.size, pts: langPts, maxPts: 5, detail: `${langSet.size} unique languages` },
        staleRatio: { value: stalePct, pts: stalePts, maxPts: 3, detail: `${stalePct}% repos not pushed in 1yr` },
        namingConsistency: { value: namePct, pts: namePts, maxPts: 2, detail: `${namePct}% repos use consistent naming` },
    };

    const score = Math.min(30, Object.values(breakdown).reduce((s, b) => s + b.pts, 0));
    return { score, maxScore: 30, breakdown };
}
