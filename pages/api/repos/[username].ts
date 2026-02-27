import type { NextApiRequest, NextApiResponse } from "next";
import { requireGet, validateUsername, sendOk, sendError, parsePagination } from "@/lib/api-helpers";
import { fetchUserRepos } from "@/lib/github/queries";
import { cacheOrFetch, cacheKey, TTL } from "@/lib/cache/cache-service";
import { GitHubRepo } from "@/lib/github/types";

type SortField = "stars" | "updated" | "name" | "forks";

function sortRepos(repos: GitHubRepo[], sort: SortField): GitHubRepo[] {
    return [...repos].sort((a, b) => {
        switch (sort) {
            case "stars": return b.stargazers_count - a.stargazers_count;
            case "forks": return b.forks_count - a.forks_count;
            case "name": return a.name.localeCompare(b.name);
            case "updated":
            default: return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
    });
}

function filterRepos(
    repos: GitHubRepo[],
    language?: string,
    type?: string
): GitHubRepo[] {
    return repos.filter((r) => {
        if (language && r.language?.toLowerCase() !== language.toLowerCase()) return false;
        if (type === "forked" && !r.fork) return false;
        if (type === "source" && r.fork) return false;
        if (type === "archived" && !r.archived) return false;
        return true;
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!requireGet(req, res)) return;

    const username = validateUsername(req.query.username);
    if (!username) {
        return res.status(400).json({ error: "Invalid GitHub username", code: "INVALID_USERNAME" });
    }

    const { page, perPage } = parsePagination(req.query);
    const sort = (String(req.query.sort ?? "updated")) as SortField;
    const language = String(req.query.language ?? "").trim() || undefined;
    const type = String(req.query.type ?? "").trim() || undefined;

    try {
        const key = cacheKey.repos(username, page);

        const raw = await cacheOrFetch<GitHubRepo[]>(
            key,
            () => fetchUserRepos(username, page, 100),   // fetch full 100 server-side
            TTL.repos
        );

        // Apply filter + sort after cache (cheap CPU ops)
        const filtered = filterRepos(raw, language, type);
        const sorted = sortRepos(filtered, sort);

        // Paginate the filtered/sorted slice for the response
        const start = (page - 1) * perPage;
        const items = sorted.slice(start, start + perPage);

        sendOk(res, {
            items,
            total: filtered.length,
            page,
            perPage,
            hasNextPage: start + perPage < filtered.length,
        }, { maxAge: TTL.repos });
    } catch (err) {
        sendError(res, err);
    }
}
