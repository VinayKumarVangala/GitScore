"use client";

import { motion } from "framer-motion";
import { FiStar, FiGitBranch, FiClock, FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { GitHubRepo } from "@/lib/github/types";
import MysticalCard from "@/components/ui/MysticalCard";
import { formatDistanceToNow } from "date-fns";

interface RepositoryCardProps {
    repo: GitHubRepo;
    onClick?: () => void;
    className?: string;
}

export type RepoHealth = "good" | "warning" | "critical";

export default function RepositoryCard({ repo, onClick, className = "" }: RepositoryCardProps) {
    // Determine health based on basic heuristics
    // - Critical: Archived AND last updated > 1 year
    // - Warning: No description OR last updated > 6 months
    // - Good: Otherwise
    const determineHealth = (r: GitHubRepo): RepoHealth => {
        const lastUpdate = new Date(r.updated_at);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        if (r.archived && lastUpdate < oneYearAgo) return "critical";
        if (!r.description || lastUpdate < sixMonthsAgo) return "warning";
        return "good";
    };

    const health = determineHealth(repo);

    const healthStyles: Record<RepoHealth, { color: string; icon: React.ReactNode; label: string }> = {
        good: {
            color: "text-emerald-400",
            icon: <FiCheckCircle />,
            label: "Healthy"
        },
        warning: {
            color: "text-amber-400",
            icon: <FiInfo />,
            label: "Stale / Missing Docs"
        },
        critical: {
            color: "text-red-400",
            icon: <FiAlertCircle />,
            label: "Archived / End of Life"
        }
    };

    const { color, icon, label } = healthStyles[health];

    return (
        <MysticalCard
            variant="interactive"
            glowIntensity="low"
            onClick={onClick}
            className={`group ${className}`}
        >
            <div className="p-4 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white group-hover:text-cyan-primary transition-colors truncate max-w-[80%]">
                        {repo.name}
                    </h3>
                    {repo.fork && (
                        <span className="text-[10px] bg-white/5 text-foreground/40 px-1.5 py-0.5 rounded border border-white/10">
                            Fork
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="text-xs text-foreground/50 mb-4 line-clamp-2 h-8">
                    {repo.description || "No description provided."}
                </p>

                {/* Meta Stats */}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                    {repo.language && (
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getLanguageColor(repo.language) }}
                            />
                            <span className="text-[10px] text-foreground/40 truncate">
                                {repo.language}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 ml-auto shrink-0">
                        <span className="flex items-center gap-1 text-[10px] text-foreground/40">
                            <FiStar size={10} /> {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-foreground/40">
                            <FiGitBranch size={10} /> {repo.forks_count}
                        </span>
                    </div>
                </div>

                {/* Footer info: Health & Date */}
                <div className="flex items-center justify-between mt-2 pt-2">
                    <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${color}`}>
                        {icon} {label}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-foreground/30">
                        <FiClock size={10} /> {formatDistanceToNow(new Date(repo.updated_at))} ago
                    </div>
                </div>
            </div>
        </MysticalCard>
    );
}

// Simple color mapping for common languages
function getLanguageColor(lang: string) {
    const colors: Record<string, string> = {
        TypeScript: "#3178c6",
        JavaScript: "#f1e05a",
        React: "#61dafb",
        Nextjs: "#ffffff",
        CSS: "#563d7c",
        HTML: "#e34c26",
        Python: "#3572A5",
        Rust: "#dea584",
        Go: "#00ADD8",
        Ruby: "#701516",
        Java: "#b07219",
        "C++": "#f34b7d",
        C: "#555555",
        PHP: "#4F5D95",
    };
    return colors[lang] || "#00FFFF";
}
