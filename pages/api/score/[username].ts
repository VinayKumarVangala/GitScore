import type { NextApiRequest, NextApiResponse } from "next";
import { requireGet, validateUsername, sendOk, sendError } from "@/lib/api-helpers";
import {
    fetchUserProfile,
    fetchAllUserRepos,
    fetchContributions,
} from "@/lib/github/queries";
import { buildScorecard } from "@/lib/scoring";
import { cacheOrFetch, staleWhileRevalidate, cacheKey, TTL } from "@/lib/cache/cache-service";
import { GitHubUser, GitHubRepo, ContributionSummary, GitHubScorecard } from "@/lib/github/types";
import { parallel } from "@/lib/github/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!requireGet(req, res)) return;

    const username = validateUsername(req.query.username);
    if (!username) {
        return res.status(400).json({ error: "Invalid GitHub username", code: "INVALID_USERNAME" });
    }

    try {
        // Check scorecard cache first (5 min TTL, stale-while-revalidate at 2 min)
        const scoreKey = cacheKey.scorecard(username);

        const scorecard = await staleWhileRevalidate<GitHubScorecard>(
            scoreKey,
            async () => {
                // Fetch all required data concurrently, each with its own cache
                const [user, repos, contrib] = await parallel<GitHubUser | GitHubRepo[] | ContributionSummary>(
                    [
                        () => cacheOrFetch<GitHubUser>(
                            cacheKey.userProfile(username),
                            () => fetchUserProfile(username),
                            TTL.userProfile
                        ),
                        () => cacheOrFetch<GitHubRepo[]>(
                            cacheKey.allRepos(username),
                            () => fetchAllUserRepos(username),
                            TTL.repos
                        ),
                        () => cacheOrFetch<ContributionSummary>(
                            cacheKey.contributions(username),
                            () => fetchContributions(username),
                            TTL.contributions
                        ),
                    ],
                    3
                );

                return buildScorecard(
                    user as GitHubUser,
                    repos as GitHubRepo[],
                    contrib as ContributionSummary
                );
            },
            { ttl: TTL.scorecard, staleAfter: TTL.scorecard / 2 }
        );

        sendOk(res, scorecard, { maxAge: TTL.scorecard });
    } catch (err) {
        sendError(res, err);
    }
}
