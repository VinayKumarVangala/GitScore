import type { NextApiRequest, NextApiResponse } from "next";
import { requireGet, validateUsername, sendOk, sendError } from "@/lib/api-helpers";
import { fetchReadmeContent } from "@/lib/github/queries";
import { analyseReadme } from "@/lib/github/utils";
import { cacheOrFetch, cacheKey, TTL } from "@/lib/cache/cache-service";
import { ReadmeQuality } from "@/lib/github/types";

interface ReadmeResponse {
    owner: string;
    repo: string;
    quality: ReadmeQuality;
    /** Truncated raw content (first 5000 chars). Full content served if < 10 kB. */
    preview: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!requireGet(req, res)) return;

    // Route is /api/readme/[owner]/[repo] — Next.js flattens catch-all
    const { owner: rawOwner, repo: rawRepo } = req.query as { owner: string; repo: string };
    const owner = String(rawOwner ?? "").trim();
    const repo = String(rawRepo ?? "").trim();

    if (!owner || !repo) {
        return res.status(400).json({ error: "owner and repo are required", code: "BAD_REQUEST" });
    }

    try {
        const key = cacheKey.readme(owner, repo);

        const result = await cacheOrFetch<ReadmeResponse>(
            key,
            async () => {
                const content = await fetchReadmeContent(owner, repo);
                const quality = analyseReadme(content);
                return {
                    owner,
                    repo,
                    quality,
                    preview: content ? content.slice(0, 5000) : null,
                };
            },
            TTL.readme
        );

        sendOk(res, result, { maxAge: TTL.readme });
    } catch (err) {
        sendError(res, err);
    }
}
