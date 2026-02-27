import { DetailedScorecard } from "@/lib/github/types";

export interface ComparisonInsight {
    type: "positive" | "negative" | "neutral";
    message: string;
    category: string;
}

export interface ComparisonResult {
    winner: string | "draw";
    differences: {
        category: string;
        diff: number;
        winner: string | "draw";
    }[];
    insights: ComparisonInsight[];
}

export function compareProfiles(
    s1: DetailedScorecard,
    s2: DetailedScorecard
): ComparisonResult {
    const categories = Object.keys(s1.dimensions) as (keyof typeof s1.dimensions)[];
    const differences = categories.map((cat) => {
        const score1 = s1.dimensions[cat].score;
        const score2 = s2.dimensions[cat].score;
        const diff = score1 - score2;

        return {
            category: s1.dimensions[cat].label,
            diff: Math.abs(diff),
            winner: diff > 0 ? s1.username : diff < 0 ? s2.username : "draw" as const,
        };
    });

    const totalWinner =
        s1.totalScore > s2.totalScore
            ? s1.username
            : s1.totalScore < s2.totalScore
                ? s2.username
                : "draw";

    const insights: ComparisonInsight[] = [];

    // Logic for generating insights
    categories.forEach((cat) => {
        const d = differences.find((diff) => diff.category === s1.dimensions[cat].label);
        if (d && d.diff > 15) {
            insights.push({
                type: d.winner === s1.username ? "positive" : "negative",
                category: d.category,
                message:
                    d.winner === s1.username
                        ? `${s1.username} significantly outperforms in ${d.category}.`
                        : `${s2.username} has a major lead in ${d.category}.`,
            });
        }
    });

    // Specific insights for language diversity or streaks
    if (Math.abs(s1.raw.activity.breakdown.streak.value - s2.raw.activity.breakdown.streak.value) > 10) {
        const streakWinner = s1.raw.activity.breakdown.streak.value > s2.raw.activity.breakdown.streak.value ? s1.username : s2.username;
        insights.push({
            type: "neutral",
            category: "Activity",
            message: `${streakWinner} maintains a much more consistent contribution streak.`,
        });
    }

    return {
        winner: totalWinner,
        differences,
        insights,
    };
}
