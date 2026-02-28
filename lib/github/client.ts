import { Octokit } from "octokit";
import { RateLimitState } from "./types";

// ─── Singleton Octokit instance ──────────────────────────────────────────────

let _octokit: Octokit | null = null;

export function getOctokit(): Octokit {
    if (_octokit) return _octokit;

    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        console.warn("[github] GITHUB_TOKEN is not defined in environment variables");
    } else {
        console.info("[github] Initializing Octokit with token (length: " + token.length + ")");
    }

    _octokit = new Octokit({
        auth: token,
        userAgent: "GitScore/1.0",
        throttle: {
            // Respect primary rate limit
            onRateLimit: (retryAfter: number, options: any, octokit: any, retryCount: number) => {
                octokit.log.warn(
                    `Rate limit hit for ${options.method} ${options.url} — retry after ${retryAfter}s (attempt ${retryCount + 1})`
                );
                return retryCount < 2;   // retry up to 2 times
            },
            // Respect secondary rate limit (abuse detection)
            onSecondaryRateLimit: (retryAfter: number, options: any, octokit: any) => {
                octokit.log.warn(
                    `Secondary rate limit hit for ${options.method} ${options.url}`
                );
                return false;            // do not retry secondary limits
            },
        },
    });

    return _octokit;
}

// ─── Rate limit monitoring ───────────────────────────────────────────────────

let _rateLimitCache: RateLimitState | null = null;
let _rateLimitFetchedAt = 0;
const RATE_CACHE_TTL = 60_000;   // re-fetch at most every 60 s

import { RateLimiter } from "./rate-limiter";

export async function fetchRateLimit(): Promise<RateLimitState> {
    const now = Date.now();
    if (_rateLimitCache && now - _rateLimitFetchedAt < RATE_CACHE_TTL) {
        return _rateLimitCache;
    }

    const octokit = getOctokit();
    const { data } = await octokit.rest.rateLimit.get();
    const core = data.rate;

    _rateLimitCache = {
        limit: core.limit,
        remaining: core.remaining,
        used: core.used,
        reset: new Date(core.reset * 1000),
    };
    _rateLimitFetchedAt = now;

    // Trigger proactive alerting if usage is high
    if (typeof window === "undefined") {
        RateLimiter.checkAndAlert();
    }

    return _rateLimitCache;
}

// ─── Retry wrapper for transient errors ─────────────────────────────────────

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

export async function withRetry<T>(
    fn: () => Promise<T>,
    {
        maxAttempts = 3,
        baseDelayMs = 600,
    }: { maxAttempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const status: number | undefined = err?.status ?? err?.response?.status;

            if (status && !RETRYABLE.has(status)) throw err;   // non-retryable

            if (attempt < maxAttempts - 1) {
                const delay = baseDelayMs * 2 ** attempt + Math.random() * 200;
                await new Promise((r) => setTimeout(r, delay));
            }
        }
    }

    throw lastError;
}

// ─── Parallel request queue ──────────────────────────────────────────────────
// Limits concurrency so we don't hammer the API all at once.

export async function parallel<T>(
    tasks: (() => Promise<T>)[],
    concurrency = 4
): Promise<T[]> {
    const results: T[] = new Array(tasks.length);
    let idx = 0;

    async function worker() {
        while (idx < tasks.length) {
            const i = idx++;
            results[i] = await tasks[i]();
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker);
    await Promise.all(workers);
    return results;
}

// ─── Typed GitHub API error ──────────────────────────────────────────────────

export class GitHubApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly url?: string
    ) {
        super(message);
        this.name = "GitHubApiError";
    }

    get isNotFound() { return this.status === 404; }
    get isUnauthorized() { return this.status === 401; }
    get isRateLimited() { return this.status === 429 || this.status === 403; }
}

export function toGitHubApiError(err: any): GitHubApiError {
    const status: number = err?.status ?? 500;
    const message: string =
        err?.response?.data?.message ?? err?.message ?? "Unknown GitHub API error";
    const url: string | undefined = err?.request?.url;
    return new GitHubApiError(status, message, url);
}
