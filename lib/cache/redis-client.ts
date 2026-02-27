// ─── Upstash Redis client with in-memory fallback ───────────────────────────
//
// When UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set we use the
// Upstash HTTP client (edge-safe, no native modules required).
// Otherwise we fall back to a process-scoped in-memory Map so the app still
// works without a Redis deployment.

/* ── Shared interface that both adapters implement ────────────────────────── */
export interface CacheAdapter {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    ttl(key: string): Promise<number>; // remaining seconds, -1 = no TTL, -2 = missing
}

/* ═══════════════════════════════════════════════════════════════════════════
   In-memory adapter  (default / fallback)
═══════════════════════════════════════════════════════════════════════════ */

interface MemEntry<T> {
    value: T;
    expiresAt: number | null; // epoch ms, null = never
}

class MemoryAdapter implements CacheAdapter {
    private store = new Map<string, MemEntry<unknown>>();

    private isExpired(entry: MemEntry<unknown>): boolean {
        return entry.expiresAt !== null && Date.now() > entry.expiresAt;
    }

    async get<T>(key: string): Promise<T | null> {
        const entry = this.store.get(key) as MemEntry<T> | undefined;
        if (!entry || this.isExpired(entry)) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        this.store.set(key, {
            value,
            expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
        });
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
    }

    async exists(key: string): Promise<boolean> {
        const entry = this.store.get(key);
        if (!entry || this.isExpired(entry)) { this.store.delete(key); return false; }
        return true;
    }

    async ttl(key: string): Promise<number> {
        const entry = this.store.get(key);
        if (!entry) return -2;
        if (this.isExpired(entry)) { this.store.delete(key); return -2; }
        if (entry.expiresAt === null) return -1;
        return Math.round((entry.expiresAt - Date.now()) / 1000);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Upstash Redis adapter  (HTTP REST — no native deps)
═══════════════════════════════════════════════════════════════════════════ */

class RedisAdapter implements CacheAdapter {
    constructor(private url: string, private token: string) { }

    private async cmd<T>(...args: (string | number)[]): Promise<T> {
        const res = await fetch(this.url, {
            method: "POST",
            headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
            body: JSON.stringify(args),
        });
        if (!res.ok) throw new Error(`Redis HTTP ${res.status}: ${await res.text()}`);
        const json = await res.json() as { result: T };
        return json.result;
    }

    async get<T>(key: string): Promise<T | null> {
        const raw = await this.cmd<string | null>("GET", key);
        if (raw === null) return null;
        try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const serialised = JSON.stringify(value);
        if (ttlSeconds) await this.cmd("SET", key, serialised, "EX", ttlSeconds);
        else await this.cmd("SET", key, serialised);
    }

    async del(key: string): Promise<void> {
        await this.cmd("DEL", key);
    }

    async exists(key: string): Promise<boolean> {
        const n = await this.cmd<number>("EXISTS", key);
        return n === 1;
    }

    async ttl(key: string): Promise<number> {
        return this.cmd<number>("TTL", key);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Singleton factory
═══════════════════════════════════════════════════════════════════════════ */

let _adapter: CacheAdapter | null = null;

export function getCacheAdapter(): CacheAdapter {
    if (_adapter) return _adapter;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
        console.info("[cache] Using Upstash Redis adapter");
        _adapter = new RedisAdapter(url, token);
    } else {
        console.info("[cache] Using in-memory cache adapter (no Redis configured)");
        _adapter = new MemoryAdapter();
    }

    return _adapter;
}

/** Replace the adapter (useful in tests). */
export function setCacheAdapter(adapter: CacheAdapter): void {
    _adapter = adapter;
}
