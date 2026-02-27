// ─── Recommendation generator ────────────────────────────────────────────────
//
// Combines scoring signals with tier selection to produce a prioritised,
// personalised list of recommendations.

import { DetailedScorecard } from "@/lib/github/types";
import { RecommendationTemplate, Difficulty } from "./templates";
import { getTemplatesForScore, TierConfig } from "./score-based";

// ─── Generated recommendation (extends template with personalisation) ─────────

export interface GeneratedRecommendation extends RecommendationTemplate {
    /** 1 = highest priority */
    priority: number;
    /** Impact as a % of the remaining points the user could gain */
    relativeImpact: number;
    /** Short personalised context sentence (mentions the user's actual data) */
    personalNote: string | null;
    tier: TierConfig["tier"];
    accentColor: string;
}

// ─── Personalisation notes ────────────────────────────────────────────────────

function personalNote(
    id: string,
    scorecard: DetailedScorecard
): string | null {
    const { raw, totalScore, topLanguages } = scorecard;
    const mainLang = topLanguages[0]?.name ?? "your primary language";

    switch (id) {
        case "profile-readme":
            return `A profile README could add up to 4 pts to your current score of ${totalScore}.`;

        case "improve-bio":
            return raw.profile.breakdown.bioQuality.pts < 2
                ? "Your bio is either missing or very short — flesh it out to get the full 4 pts."
                : null;

        case "add-license":
            return `${raw.codeQuality.breakdown.licenseCoverage.detail}. Adding MIT to unlicensed repos is a quick win.`;

        case "improve-readme":
            return `README quality average is ${raw.codeQuality.breakdown.readmeCoverage.value}/100 — a detailed README in ${mainLang} projects will have the biggest effect.`;

        case "add-topics":
            return `${raw.codeQuality.breakdown.topicsCoverage.detail}. Topics make your repos discoverable via GitHub Explore.`;

        case "add-descriptions":
            return `${raw.codeQuality.breakdown.descCoverage.detail}. One sentence per repo is all it takes.`;

        case "build-streak":
            return `Your longest streak is ${raw.activity.breakdown.streak.value} days. Even 1 commit/day adds up fast.`;

        case "contribute-oss":
            return `${raw.community.breakdown.externalContrib.detail}. Every PR to an external repo counts toward your community score.`;

        case "grow-followers":
            return `${raw.community.breakdown.followerScore.detail}. Sharing quality work publicly is the most reliable growth strategy.`;

        default:
            return null;
    }
}

// ─── Priority ranking ─────────────────────────────────────────────────────────
// Combines maxImpact with difficulty penalty to surface the best ROI first.

function computePriority(template: RecommendationTemplate): number {
    const difficultyPenalty: Record<Difficulty, number> = {
        easy: 0,
        medium: 5,
        hard: 15,
    };
    // Lower number = higher priority
    return 100 - template.maxImpact * 3 + difficultyPenalty[template.difficulty];
}

// ─── Main generator ───────────────────────────────────────────────────────────

export interface GeneratorOutput {
    tier: TierConfig;
    recommendations: GeneratedRecommendation[];
    /** Total potential points recoverable from these recommendations */
    maxRecoverable: number;
}

export function generateRecommendations(
    scorecard: DetailedScorecard,
    completedIds: string[] = []
): GeneratorOutput {
    const { totalScore } = scorecard;
    const maxPossible = 100;
    const remaining = maxPossible - totalScore;

    const { tier, templates } = getTemplatesForScore(totalScore, completedIds);

    // Sort by ROI (impact / difficulty)
    const sorted = [...templates].sort((a, b) => computePriority(a) - computePriority(b));

    const maxRecoverable = sorted.reduce((s, t) => s + t.maxImpact, 0);

    const recommendations: GeneratedRecommendation[] = sorted.map((t, i) => ({
        ...t,
        priority: i + 1,
        relativeImpact: remaining > 0 ? Math.round((t.maxImpact / remaining) * 100) : 0,
        personalNote: personalNote(t.id, scorecard),
        tier: tier.tier,
        accentColor: tier.accent,
    }));

    return { tier, recommendations, maxRecoverable };
}
