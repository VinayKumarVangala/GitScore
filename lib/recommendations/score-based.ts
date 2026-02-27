// ─── Score-based recommendation selection ────────────────────────────────────
//
// Maps total score ranges to prioritised sets of recommendation IDs.
// Lower scores get more fundamental (critical) recommendations;
// higher scores get polish-level suggestions.

import {
    RecommendationTemplate,
    ALL_TEMPLATES,
    Difficulty,
} from "./templates";

export type ScoreTier = "critical" | "foundation" | "enhancement" | "polish";

export interface TierConfig {
    tier: ScoreTier;
    label: string;
    description: string;
    accent: string;    // Tailwind color token suffix
    maxIds: string[];  // template IDs to consider (ordered by priority)
    maxSuggestions: number;
}

// ─── Tier definitions ─────────────────────────────────────────────────────────

const CRITICAL_TIER: TierConfig = {
    tier: "critical",
    label: "Critical Improvements",
    description: "Your profile needs foundational work. Focus on these high-impact items first.",
    accent: "red",
    maxIds: [
        "profile-readme",
        "improve-bio",
        "add-license",
        "improve-readme",
        "add-descriptions",
        "add-topics",
        "add-website",
        "build-streak",
        "engage-issues",
        "pin-repos",
    ],
    maxSuggestions: 5,
};

const FOUNDATION_TIER: TierConfig = {
    tier: "foundation",
    label: "Foundation Improvements",
    description: "Good start — these changes will significantly boost your score.",
    accent: "amber",
    maxIds: [
        "improve-readme",
        "add-license",
        "profile-readme",
        "add-topics",
        "add-descriptions",
        "build-streak",
        "contribute-oss",
        "add-website",
        "pin-repos",
        "engage-issues",
    ],
    maxSuggestions: 5,
};

const ENHANCEMENT_TIER: TierConfig = {
    tier: "enhancement",
    label: "Enhancement Suggestions",
    description: "You have a solid profile. These refinements will push you to the next grade.",
    accent: "cyan",
    maxIds: [
        "contribute-oss",
        "build-streak",
        "improve-readme",
        "add-topics",
        "engage-issues",
        "grow-followers",
        "pin-repos",
        "add-license",
    ],
    maxSuggestions: 4,
};

const POLISH_TIER: TierConfig = {
    tier: "polish",
    label: "Polish Recommendations",
    description: "Excellent profile! These fine-tunings can take you to the very top.",
    accent: "emerald",
    maxIds: [
        "create-popular-repo",
        "grow-followers",
        "build-streak",
        "contribute-oss",
        "engage-issues",
    ],
    maxSuggestions: 3,
};

// ─── Tier resolver ────────────────────────────────────────────────────────────

export function getTierForScore(totalScore: number): TierConfig {
    if (totalScore < 40) return CRITICAL_TIER;
    if (totalScore < 60) return FOUNDATION_TIER;
    if (totalScore < 80) return ENHANCEMENT_TIER;
    return POLISH_TIER;
}

/** Return ordered templates for a given score, filtered to what the user actually needs. */
export function getTemplatesForScore(
    totalScore: number,
    /** IDs the user has already completed (from localStorage / done list) */
    completedIds: string[] = []
): { tier: TierConfig; templates: RecommendationTemplate[] } {
    const tier = getTierForScore(totalScore);
    const templateMap = Object.fromEntries(ALL_TEMPLATES.map((t) => [t.id, t]));

    const filtered = tier.maxIds
        .filter((id) => !completedIds.includes(id))
        .map((id) => templateMap[id])
        .filter(Boolean)
        .slice(0, tier.maxSuggestions);

    return { tier, templates: filtered };
}

/** Difficulty → display colour */
export const DIFFICULTY_COLOURS: Record<Difficulty, string> = {
    easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    medium: "text-amber-400   border-amber-400/30   bg-amber-400/10",
    hard: "text-red-400     border-red-400/30     bg-red-400/10",
};

/** Difficulty → label */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
};
