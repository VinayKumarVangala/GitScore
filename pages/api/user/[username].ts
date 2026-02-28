import type { NextApiRequest, NextApiResponse } from "next";
import { requireGet, validateUsername, sendOk, sendError } from "@/lib/api-helpers";
import { fetchUserProfile } from "@/lib/github/queries";
import { cacheOrFetch, cacheKey, TTL } from "@/lib/cache/cache-service";
import { GitHubUser } from "@/lib/github/types";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!requireGet(req, res)) return;

    const username = validateUsername(req.query.username);
    if (!username) {
        return res.status(400).json({ error: "Invalid GitHub username", code: "INVALID_USERNAME" });
    }

    try {
        const key = cacheKey.userProfile(username);
        let cached = false;

        const existing = await import("@/lib/cache/redis-client")
            .then(({ getCacheAdapter }) => getCacheAdapter().get<GitHubUser>(key));

        if (existing) {
            cached = true;
            return sendOk(res, existing, { cached: true, maxAge: TTL.userProfile });
        }

        const user = await cacheOrFetch(
            key,
            () => fetchUserProfile(username),
            TTL.userProfile
        );

        sendOk(res, user, { cached, maxAge: TTL.userProfile });
    } catch (err) {
        console.error(`[api] Error fetching profile for ${username}:`, err);
        sendError(res, err);
    }
}
