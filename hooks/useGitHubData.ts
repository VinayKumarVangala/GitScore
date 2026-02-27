"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    GitHubUser,
    GitHubRepo,
    ContributionSummary,
    PinnedRepo,
    GitHubScorecard,
    ScoreGrade,
} from "@/lib/github/types";

// ─── Shared fetch state ───────────────────────────────────────────────────────

export interface AsyncState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    /** Timestamp of last successful fetch (epoch ms) */
    fetchedAt: number | null;
}

function initState<T>(): AsyncState<T> {
    return { data: null, isLoading: false, error: null, fetchedAt: null };
}

// ─── API response envelope ────────────────────────────────────────────────────

interface ApiEnvelope<T> {
    data?: T;
    error?: string;
    cached?: boolean;
    cachedAt?: string;
}

async function apiFetch<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const json = (await res.json()) as ApiEnvelope<T>;

    if (!res.ok || json.error) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
    }
    if (!json.data) throw new Error("Empty response from API");
    return json.data;
}

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelay = 800
): Promise<T> {
    let last: unknown;
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await fn();
        } catch (err) {
            last = err;
            if (i < maxAttempts - 1) {
                await new Promise((r) => setTimeout(r, baseDelay * 2 ** i + Math.random() * 300));
            }
        }
    }
    throw last;
}

// ─── useGitHubData – master hook ─────────────────────────────────────────────

export interface GitHubData {
    profile: AsyncState<GitHubUser>;
    repos: AsyncState<GitHubRepo[]>;
    contributions: AsyncState<ContributionSummary>;
    pinned: AsyncState<PinnedRepo[]>;
    scorecard: AsyncState<GitHubScorecard>;
}

interface UseGitHubDataOptions {
    /** If false, skip fetching (useful when username hasn't been submitted yet). */
    enabled?: boolean;
    /** Number of retries per request (default 3). */
    retries?: number;
}

export function useGitHubData(
    username: string | null,
    { enabled = true, retries = 3 }: UseGitHubDataOptions = {}
) {
    const [profile, setProfile] = useState<AsyncState<GitHubUser>>(initState);
    const [repos, setRepos] = useState<AsyncState<GitHubRepo[]>>(initState);
    const [contributions, setContributions] = useState<AsyncState<ContributionSummary>>(initState);
    const [pinned, setPinned] = useState<AsyncState<PinnedRepo[]>>(initState);
    const [scorecard, setScorecard] = useState<AsyncState<GitHubScorecard>>(initState);

    // Abort controller so stale requests are cancelled on username change
    const abortRef = useRef<AbortController | null>(null);

    // Generic fetch-into-state helper
    const loadResource = useCallback(
        async <T>(
            url: string,
            setter: React.Dispatch<React.SetStateAction<AsyncState<T>>>
        ) => {
            setter((s) => ({ ...s, isLoading: true, error: null }));
            try {
                const data = await withRetry(() => apiFetch<T>(url), retries);
                setter({ data, isLoading: false, error: null, fetchedAt: Date.now() });
            } catch (err: any) {
                setter((s) => ({
                    ...s,
                    isLoading: false,
                    error: err?.message ?? "Unknown error",
                }));
            }
        },
        [retries]
    );

    const fetchAll = useCallback(async () => {
        if (!username || !enabled) return;

        // Cancel any in-flight requests from a previous username
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const u = encodeURIComponent(username.trim());

        // Fire profile + pinned in parallel first; scorecard last (depends on all)
        await Promise.all([
            loadResource<GitHubUser>(`/api/github/profile?username=${u}`, setProfile),
            loadResource<GitHubRepo[]>(`/api/github/repos?username=${u}`, setRepos),
            loadResource<ContributionSummary>(`/api/github/contributions?username=${u}`, setContributions),
            loadResource<PinnedRepo[]>(`/api/github/pinned?username=${u}`, setPinned),
        ]);

        // Scorecard aggregates all of the above server-side
        await loadResource<GitHubScorecard>(`/api/github/scorecard?username=${u}`, setScorecard);
    }, [username, enabled, loadResource]);

    useEffect(() => {
        fetchAll();
        return () => { abortRef.current?.abort(); };
    }, [fetchAll]);

    const refetch = useCallback(() => fetchAll(), [fetchAll]);

    const isLoading =
        profile.isLoading || repos.isLoading ||
        contributions.isLoading || pinned.isLoading;

    const hasError =
        !!(profile.error || repos.error || contributions.error || pinned.error);

    return {
        profile,
        repos,
        contributions,
        pinned,
        scorecard,
        isLoading,
        hasError,
        refetch,
    };
}

// ─── useUserSearch – lightweight username lookup hook ─────────────────────────

export interface UserSearchState {
    data: GitHubUser | null;
    isLoading: boolean;
    error: string | null;
}

export function useUserSearch() {
    const [state, setState] = useState<UserSearchState>({
        data: null,
        isLoading: false,
        error: null,
    });

    const search = useCallback(async (username: string) => {
        if (!username.trim()) return;
        setState({ data: null, isLoading: true, error: null });
        try {
            const u = encodeURIComponent(username.trim());
            const data = await withRetry(() =>
                apiFetch<GitHubUser>(`/api/github/profile?username=${u}`)
            );
            setState({ data, isLoading: false, error: null });
        } catch (err: any) {
            setState({ data: null, isLoading: false, error: err?.message ?? "User not found" });
        }
    }, []);

    const reset = useCallback(() => {
        setState({ data: null, isLoading: false, error: null });
    }, []);

    return { ...state, search, reset };
}

// ─── usePagination – generic pagination helper ────────────────────────────────

export interface PaginationState<T> {
    items: T[];
    page: number;
    hasNextPage: boolean;
    isLoadingMore: boolean;
    error: string | null;
}

export function usePagination<T>(
    fetchPage: (page: number) => Promise<T[]>,
    pageSize = 30
) {
    const [state, setState] = useState<PaginationState<T>>({
        items: [],
        page: 0,
        hasNextPage: true,
        isLoadingMore: false,
        error: null,
    });

    const loadMore = useCallback(async () => {
        if (state.isLoadingMore || !state.hasNextPage) return;

        setState((s) => ({ ...s, isLoadingMore: true, error: null }));
        try {
            const nextPage = state.page + 1;
            const newItems = await fetchPage(nextPage);
            setState((s) => ({
                items: [...s.items, ...newItems],
                page: nextPage,
                hasNextPage: newItems.length === pageSize,
                isLoadingMore: false,
                error: null,
            }));
        } catch (err: any) {
            setState((s) => ({
                ...s,
                isLoadingMore: false,
                error: err?.message ?? "Failed to load more",
            }));
        }
    }, [state, fetchPage, pageSize]);

    const reset = useCallback(() => {
        setState({ items: [], page: 0, hasNextPage: true, isLoadingMore: false, error: null });
    }, []);

    // Auto-load page 1
    const initialised = useRef(false);
    useEffect(() => {
        if (!initialised.current) { initialised.current = true; loadMore(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { ...state, loadMore, reset };
}
