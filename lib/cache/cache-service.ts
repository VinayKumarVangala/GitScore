import { getCacheAdapter } from "./redis-client";

// ─── TTL configuration ────────────────────────────────────────────────────────
// All values in seconds.  Tune per data type to balance freshness vs API budget.

export const TTL = {
    userProfile: 60 * 15,       // 15 min  — changes rarely
    repos: 60 * 10,       // 10 min  — medium freshness
    events: 60 * 5,        //  5 min  — activity is time-sensitive
    contributions: 60 * 5,        //  5 min
    languages: 60 * 60,       //  1 hr   — almost never changes
    readme: 60 * 60,       //  1 hr
    pinnedRepos: 60 * 10,       // 10 min
    scorecard: 60 * 5,        //  5 min  — derived, cheap to rebuild
    rateLimit: 60,            //  1 min
} as const;

export type TtlKey = keyof typeof TTL;

// ─── Cache key builders ───────────────────────────────────────────────────────

export const cacheKey = {
    userProfile: (u: string) => `gh:user:${u.toLowerCase()}`,
    repos: (u: string, page = 1) => `gh:repos:${u.toLowerCase()}:p${page}`,
    allRepos: (u: string) => `gh:repos:${u.toLowerCase()}:all`,
    events: (u: string, page = 1) => `gh:events:${u.toLowerCase()}:p${page}`,
    contributions: (u: string) => `gh:contrib:${u.toLowerCase()}`,
    languages: (owner: string, repo: string) => `gh:langs:${owner.toLowerCase()}/${repo}`,
    readme: (owner: string, repo: string) => `gh:readme:${owner.toLowerCase()}/${repo}`,
    pinnedRepos: (u: string) => `gh:pinned:${u.toLowerCase()}`,
    scorecard: (u: string) => `gh:score:${u.toLowerCase()}`,
};

// ─── Core cache service ───────────────────────────────────────────────────────

export const cache = {
    /* ── Read ── */
    async get<T>(key: string): Promise<T | null> {
        try {
            return await getCacheAdapter().get<T>(key);
        } catch (err) {
            console.error("[cache] get error:", err);
            return null;
        }
    },

    /* ── Write ── */
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            await getCacheAdapter().set(key, value, ttl);
        } catch (err) {
            console.error("[cache] set error:", err);
        }
    },

    /* ── Delete ── */
    async del(key: string): Promise<void> {
        try {
            await getCacheAdapter().del(key);
        } catch (err) {
            console.error("[cache] del error:", err);
        }
    },

    /* ── TTL remaining ── */
    async ttl(key: string): Promise<number> {
        try {
            return await getCacheAdapter().ttl(key);
        } catch {
            return -2;
        }
    },
};

// ─── Stale-while-revalidate ───────────────────────────────────────────────────
//
// Returns a cached value immediately and fires a background refresh when
// the TTL has dropped below `staleAfter` seconds.  The caller always gets
// a fast response; the next call will receive the fresh value.

type Fetcher<T> = () => Promise<T>;

interface SWROptions {
    ttl: number;            // full TTL in seconds (initial write)
    staleAfter: number;     // seconds remaining before kicking off refresh
}

export async function staleWhileRevalidate<T>(
    key: string,
    fetcher: Fetcher<T>,
    { ttl, staleAfter }: SWROptions
): Promise<T> {
    const cached = await cache.get<T>(key);

    if (cached !== null) {
        // Check staleness asynchronously — do NOT await so we return immediately
        cache.ttl(key).then((remaining) => {
            if (remaining >= 0 && remaining < staleAfter) {
                fetcher().then((fresh) => cache.set(key, fresh, ttl)).catch(() => {
                    /* silent — stale value still served */
                });
            }
        });

        return cached;
    }

    // Cache miss — fetch, cache, and return
    const fresh = await fetcher();
    await cache.set(key, fresh, ttl);
    return fresh;
}

// ─── Cache-or-fetch helper (simple version without SWR) ──────────────────────

export async function cacheOrFetch<T>(
    key: string,
    fetcher: Fetcher<T>,
    ttlSeconds: number
): Promise<T> {
    const cached = await cache.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await cache.set(key, fresh, ttlSeconds);
    return fresh;
}

// ─── Invalidate all keys for a user ──────────────────────────────────────────
// (Memory adapter only: iterates known key patterns.  Redis would need SCAN.)

export async function invalidateUser(username: string): Promise<void> {
    const u = username.toLowerCase();
    await Promise.all([
        cache.del(cacheKey.userProfile(u)),
        cache.del(cacheKey.allRepos(u)),
        cache.del(cacheKey.contributions(u)),
        cache.del(cacheKey.pinnedRepos(u)),
        cache.del(cacheKey.scorecard(u)),
        ...([1, 2, 3].map((p) => cache.del(cacheKey.repos(u, p)))),
        ...([1, 2, 3].map((p) => cache.del(cacheKey.events(u, p)))),
    ]);
}
