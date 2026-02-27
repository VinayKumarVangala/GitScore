"use client";

import { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiClock, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import MysticalButton from "@/components/ui/MysticalButton";
import { WatchlistEntry } from "@/lib/db/supabase-client";

interface WatchlistButtonProps {
    username: string;
    currentScore: number;
    currentGrade: string;
    className?: string;
}

export default function WatchlistButton({
    username,
    currentScore,
    currentGrade,
    className = ""
}: WatchlistButtonProps) {
    const [status, setStatus] = useState<WatchlistEntry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await fetch(`/api/watchlist?username=${username}`);
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                }
            } catch (err) {
                console.error("Failed to fetch watchlist status");
            } finally {
                setIsLoading(false);
            }
        }
        fetchStatus();
    }, [username]);

    const toggleWatchlist = async () => {
        setIsProcessing(true);
        try {
            if (status) {
                // Remove
                const res = await fetch(`/api/watchlist?username=${username}`, { method: "DELETE" });
                if (res.ok) setStatus(null);
            } else {
                // Add
                const res = await fetch("/api/watchlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, score: currentScore, grade: currentGrade }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                }
            }
        } catch (err) {
            alert("Database scrying failed. Ritual interrupted.");
        } finally {
            setIsProcessing(false);
        }
    };

    const hasImproved = status && currentScore > status.last_score;
    const hasDropped = status && currentScore < status.last_score;

    if (isLoading) {
        return (
            <div className={`h-10 w-32 bg-white/5 animate-pulse rounded-xl ${className}`} />
        );
    }

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <MysticalButton
                variant={status ? "secondary" : "ghost"}
                onClick={toggleWatchlist}
                isLoading={isProcessing}
                className={`gap-2 w-full transition-all duration-500 ${status ? 'border-cyan-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : 'border-white/10'}`}
            >
                {status ? (
                    <>
                        <FiEyeOff className="text-cyan-primary" />
                        <span className="text-cyan-primary">Unwatch</span>
                    </>
                ) : (
                    <>
                        <FiEye /> Watch Profile
                    </>
                )}
            </MysticalButton>

            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/40 border border-white/5"
                    >
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-foreground/40">
                            <FiClock size={10} />
                            {new Date(status.last_checked).toLocaleDateString()}
                        </div>

                        {(hasImproved || hasDropped) && (
                            <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${hasImproved ? 'text-green-400' : 'text-red-400'}`}>
                                {hasImproved ? '▲ Better' : '▼ Lower'}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
