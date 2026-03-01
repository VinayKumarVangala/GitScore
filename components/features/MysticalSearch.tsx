"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiZap, FiLoader, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import MysticalInput from "@/components/ui/MysticalInput";
import MysticalButton from "@/components/ui/MysticalButton";
import { useSearch } from "@/hooks/useSearch";
import SearchHistory, { addToSearchHistory } from "./SearchHistory";

interface MysticalSearchProps {
    initialValue?: string;
    autoFocus?: boolean;
}

const POPULAR_USERS = ["gaearon", "shadcn", "leerob", "addyosmani", "delbaoliveira"];

export default function MysticalSearch({ initialValue = "", autoFocus = false }: MysticalSearchProps) {
    const { query, setQuery, error, isLoading, handleSearch } = useSearch();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialValue) setQuery(initialValue);
    }, [initialValue, setQuery]);

    const onSearchSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query) {
            await handleSearch(query);
            if (!error) addToSearchHistory(query);
        }
    };

    const handleSuggestionClick = (username: string) => {
        setQuery(username);
        handleSearch(username);
        addToSearchHistory(username);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <form
                onSubmit={onSearchSubmit}
                className="relative group"
                role="search"
                aria-label="GitHub profile search"
            >
                {/* Glowing Background Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-primary/20 via-purple-500/10 to-cyan-primary/20 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    <div className="w-full sm:flex-1">
                        <MysticalInput
                            ref={inputRef}
                            id="github-search-input"
                            label="GitHub Username"
                            placeholder="Enter GitHub username..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onClear={() => setQuery("")}
                            autoFocus={autoFocus}
                            className="py-4 text-lg border-white/10"
                            leftIcon={<FiSearch className="text-cyan-primary group-hover:animate-pulse" aria-hidden="true" size={20} />}
                        />
                    </div>

                    <MysticalButton
                        type="submit"
                        size="lg"
                        isLoading={isLoading}
                        disabled={!query || isLoading}
                        className="mt-2 sm:mt-6 px-8 w-full sm:w-auto shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]"
                    >
                        Explore <FiArrowRight className="ml-2" aria-hidden="true" />
                    </MysticalButton>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            role="alert"
                            aria-live="assertive"
                            className="absolute left-0 right-0 top-[115%] sm:top-[110%] px-4 py-2 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center gap-2 text-xs font-bold text-red-400 z-50 text-center justify-center"
                        >
                            <FiAlertCircle size={14} aria-hidden="true" /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            {/* Auxiliary Controls */}
            <div className="flex flex-col items-center justify-center gap-6 px-4">
                <SearchHistory onSelect={handleSuggestionClick} />

                <div className="flex flex-col items-center gap-3" role="group" aria-label="Popular users to explore">
                    <span id="popular-users-label" className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 text-center">Popular Explorations:</span>
                    <div className="flex flex-wrap justify-center gap-2" aria-labelledby="popular-users-label">
                        {POPULAR_USERS.map((user) => (
                            <button
                                key={user}
                                onClick={() => handleSuggestionClick(user)}
                                aria-label={`Search for ${user}`}
                                className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-primary/30 text-[10px] font-bold text-foreground/50 hover:text-cyan-primary transition-all focus:ring-2 focus:ring-cyan-primary outline-none"
                            >
                                {user}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
