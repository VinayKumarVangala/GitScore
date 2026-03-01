"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitHubRepo } from "@/lib/github/types";
import MysticalCard from "@/components/ui/MysticalCard";

interface StarConstellationProps {
    repos: GitHubRepo[];
    className?: string;
}

export default function StarConstellation({ repos, className = "" }: StarConstellationProps) {
    // Select top 12 repositories by stars
    const topRepos = useMemo(() => {
        return [...repos]
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 15);
    }, [repos]);

    const [hoveredRepo, setHoveredRepo] = useState<string | null>(null);

    // Generate random positions (seeded or fixed by repo ID for consistency)
    const stars = useMemo(() => {
        return topRepos.map((repo, idx) => {
            // Use index and id to create stable "random" positions
            const seed = repo.id + idx;
            const x = 10 + (seed % 80); // 10% to 90%
            const y = 10 + ((seed * 13) % 80);

            // Calculate radius based on stars (log scale for better visual variance)
            const radius = 2 + Math.log2(repo.stargazers_count + 1) * 2;

            return { repo, x, y, radius };
        });
    }, [topRepos]);

    return (
        <MysticalCard className={`flex flex-col relative overflow-hidden h-[400px] ${className}`}>
            <div className="p-5 border-b border-white/5 z-10 bg-card/60 backdrop-blur-sm">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Star Constellation</h3>
                <p className="text-[10px] text-foreground/40 font-bold uppercase mt-0.5 mb-2">Mapping your most impactful work</p>
                <p className="text-xs text-cyan-primary/70">Each star represents a repository. The size of the star correlates to its popularity (stars/forks), and connections indicate shared technological ecosystems.</p>
            </div>

            {/* Galaxy Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="flex-1 relative cursor-crosshair">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Connections (Lines between nearby stars) */}
                    {stars.map((star, i) => {
                        const nearest = stars
                            .slice(i + 1)
                            .sort((a, b) => {
                                const distA = Math.hypot(star.x - a.x, star.y - a.y);
                                const distB = Math.hypot(star.x - b.x, star.y - b.y);
                                return distA - distB;
                            })[0];

                        if (!nearest) return null;

                        return (
                            <motion.line
                                key={`line-${star.repo.id}-${nearest.repo.id}`}
                                x1={star.x}
                                y1={star.y}
                                x2={nearest.x}
                                y2={nearest.y}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.15 }}
                                transition={{ delay: i * 0.1, duration: 2 }}
                                stroke="white"
                                strokeWidth="0.1"
                                strokeDasharray="0.5 0.5"
                            />
                        );
                    })}

                    {/* Stars */}
                    {stars.map((star, i) => (
                        <motion.g
                            key={star.repo.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
                            onMouseEnter={() => setHoveredRepo(star.repo.name)}
                            onMouseLeave={() => setHoveredRepo(null)}
                            className="cursor-pointer"
                        >
                            <circle
                                cx={star.x}
                                cy={star.y}
                                r={star.radius / 10} // small scale for svg viewbox 100x100
                                fill={star.repo.stargazers_count > 50 ? "#00FFFF" : "white"}
                                style={{ filter: `drop-shadow(0 0 ${star.radius / 20}px rgba(0,255,255,0.8))` }}
                            />
                            <motion.circle
                                cx={star.x}
                                cy={star.y}
                                r={star.radius / 8}
                                fill="transparent"
                                stroke="cyan"
                                strokeWidth="0.05"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ duration: 3 + (i % 3), repeat: Infinity }}
                            />
                        </motion.g>
                    ))}
                </svg>

                {/* Tooltip Overlay */}
                <AnimatePresence>
                    {hoveredRepo && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute pointer-events-none bg-card/90 border border-cyan-primary/30 backdrop-blur-lg p-2 rounded-xl shadow-2xl z-20"
                            style={{
                                left: `${stars.find(s => s.repo.name === hoveredRepo)!.x}%`,
                                top: `${stars.find(s => s.repo.name === hoveredRepo)!.y}%`,
                                transform: "translate(-50%, -120%)"
                            }}
                        >
                            <p className="text-xs font-bold text-cyan-primary whitespace-nowrap">{hoveredRepo}</p>
                            <p className="text-[10px] text-white/50">{stars.find(s => s.repo.name === hoveredRepo)!.repo.stargazers_count} stars</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-3 bg-white/5 border-t border-white/5 flex gap-4 overflow-x-auto no-scrollbar">
                {topRepos.slice(0, 5).map(r => (
                    <div key={r.id} className="flex flex-col shrink-0 min-w-[70px]">
                        <span className="text-[8px] font-bold text-foreground/40 uppercase tracking-tighter truncate w-full">{r.name}</span>
                        <span className="text-[10px] font-black text-white">{r.stargazers_count} ⭐</span>
                    </div>
                ))}
            </div>
        </MysticalCard>
    );
}
