import { NextApiRequest, NextApiResponse } from "next";
import { fetchUserProfile, fetchUserRepos, fetchUserEvents, fetchContributions, fetchPinnedRepos } from "@/lib/github/queries";
import { calculateScorecard } from "@/lib/scoring/calculator";
import { generateBadgeSvg, BadgeStyle } from "@/lib/badge/badge-generator";
import { cache } from "@/lib/cache/cache-service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { username, style, label, showIcon } = req.query;

    if (!username || typeof username !== "string") {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        const cacheKey = `badge:${username}:${style || 'mystical'}`;
        const cachedBadge = await cache.get<string>(cacheKey);

        if (cachedBadge) {
            res.setHeader("Content-Type", "image/svg+xml");
            res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
            return res.send(cachedBadge);
        }

        // Fetch data for scoring
        const [user, repos, events, contrib, pinned] = await Promise.all([
            fetchUserProfile(username),
            fetchUserRepos(username),
            fetchUserEvents(username),
            fetchContributions(username),
            fetchPinnedRepos(username)
        ]);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const scorecard = calculateScorecard({ user, repos, events, contrib, pinned });

        const svg = generateBadgeSvg({
            username,
            score: scorecard.totalScore,
            grade: scorecard.grade,
            style: (style as BadgeStyle) || "mystical",
            label: (label as string) || "GitScore",
            showIcon: showIcon !== "false",
        });

        await cache.set(cacheKey, svg, 3600); // Cache for 1 hour

        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
        res.send(svg);
    } catch (error: any) {
        console.error("Badge Generation Error:", error);
        res.status(500).json({ error: "internal server error" });
    }
}
