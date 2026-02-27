"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";

export function useSearch() {
    const [query, setQuery] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validateUsername = (username: string) => {
        if (!username) return "Username is required";
        if (username.length > 39) return "Username too long";
        if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) {
            return "Invalid GitHub username format";
        }
        return null;
    };

    const handleSearch = useCallback(async (username: string) => {
        const validationError = validateUsername(username);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            // First check if user exists via our API
            const res = await fetch(`/api/user/${username}`);
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("User not found on GitHub");
                }
                throw new Error("Failed to fetch user data");
            }

            // If exists, navigate to score page
            router.push(`/score/${username}`);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    return {
        query,
        setQuery,
        error,
        setError,
        isLoading,
        handleSearch,
        validateUsername
    };
}
