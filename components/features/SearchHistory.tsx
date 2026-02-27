"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiTrash2, FiUser, FiArrowUpRight } from "react-icons/fi";
import MysticalCard from "@/components/ui/MysticalCard";

interface SearchHistoryProps {
    onSelect: (username: string) => void;
    className?: string;
}

const MAX_HISTORY = 5;

export default function SearchHistory({ onSelect, className = "" }: SearchHistoryProps) {
    const [history, setHistory] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("git_score_history");
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                setHistory([]);
            }
        }
    }, []);

    const clearHistory = () => {
        localStorage.removeItem("git_score_history");
        setHistory([]);
    };

    if (history.length === 0) return null;

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-cyan-primary transition-colors mb-2"
            >
                <FiClock size={12} /> Recent Explorations
            </button>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 z-50 mt-2"
                    >
                        <MysticalCard padding="none" className="overflow-hidden border-white/10 shadow-2xl">
                            <div className="flex flex-col">
                                {history.map((username, idx) => (
                                    <button
                                        key={username}
                                        onClick={() => onSelect(username)}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group text-left border-b border-white/5 last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-white/5 text-foreground/40 group-hover:text-cyan-primary transition-colors">
                                                <FiUser size={14} />
                                            </div>
                                            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                                                {username}
                                            </span>
                                        </div>
                                        <FiArrowUpRight size={14} className="text-foreground/20 group-hover:text-cyan-primary transition-opacity" />
                                    </button>
                                ))}

                                <button
                                    onClick={clearHistory}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-400/5 hover:bg-red-400/10 text-[10px] font-black uppercase text-red-400/40 hover:text-red-400 transition-all tracking-widest"
                                >
                                    <FiTrash2 size={10} /> Clear History
                                </button>
                            </div>
                        </MysticalCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper to update history without hooks
export function addToSearchHistory(username: string) {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("git_score_history");
    let history: string[] = [];

    try {
        history = saved ? JSON.parse(saved) : [];
    } catch (e) { }

    // Filter out existing, add to front, slice to max
    const updated = [
        username,
        ...history.filter(u => u.toLowerCase() !== username.toLowerCase())
    ].slice(0, MAX_HISTORY);

    localStorage.setItem("git_score_history", JSON.stringify(updated));
}
