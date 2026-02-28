import type { NextApiRequest, NextApiResponse } from "next";
import { GitHubApiError } from "@/lib/github/client";

// ─── Response envelope ────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    code?: string;
    cached?: boolean;
    cachedAt?: string;
}

// ─── Username validation ──────────────────────────────────────────────────────

const USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export function validateUsername(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    if (!USERNAME_RE.test(trimmed)) return null;
    return trimmed;
}

// ─── Only allow GET requests ──────────────────────────────────────────────────

export function requireGet(
    req: NextApiRequest,
    res: NextApiResponse
): boolean {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        res.status(405).json({ error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
        return false;
    }
    return true;
}

// ─── Standard success response ────────────────────────────────────────────────

export function sendOk<T>(
    res: NextApiResponse,
    data: T,
    opts: { cached?: boolean; cachedAt?: Date; maxAge?: number } = {}
): void {
    const { cached = false, cachedAt, maxAge = 60 } = opts;

    res.setHeader("Cache-Control", `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
    if (cached && cachedAt) res.setHeader("X-Cache", "HIT");

    res.status(200).json({
        data,
        cached,
        ...(cachedAt ? { cachedAt: cachedAt.toISOString() } : {}),
    } satisfies ApiResponse<T>);
}

// ─── Typed error handler ──────────────────────────────────────────────────────

export function sendError(
    res: NextApiResponse,
    err: unknown
): void {
    if (err instanceof GitHubApiError) {
        if (err.isNotFound) {
            res.status(404).json({ error: "GitHub user or resource not found", code: "NOT_FOUND" });
            return;
        }
        if (err.isUnauthorized) {
            res.status(401).json({ error: "Invalid or missing GitHub token", code: "UNAUTHORIZED" });
            return;
        }
        if (err.isRateLimited) {
            res.status(429).json({ error: "GitHub API rate limit exceeded — try again soon", code: "RATE_LIMITED" });
            return;
        }
        res.status(502).json({ error: err.message, code: "GITHUB_ERROR" });
        return;
    }

    const msg = err instanceof Error ? err.message : "Internal server error";
    console.error("[api] Unhandled error:", err);
    if (err instanceof Error && err.stack) {
        console.error("[api] Error stack:", err.stack);
    }
    res.status(500).json({
        error: msg,
        code: "INTERNAL_ERROR",
        details: process.env.NODE_ENV === "development" ? err : undefined
    });
}

// ─── Pagination query params ──────────────────────────────────────────────────

export interface PaginationParams {
    page: number;
    perPage: number;
}

export function parsePagination(query: NextApiRequest["query"]): PaginationParams {
    const page = Math.max(1, Number(query.page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(query.perPage) || 30));
    return { page, perPage };
}
