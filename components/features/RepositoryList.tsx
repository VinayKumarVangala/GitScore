"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiChevronDown, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { GitHubRepo } from "@/lib/github/types";
import RepositoryCard from "./RepositoryCard";
import MysticalInput from "@/components/ui/MysticalInput";
import MysticalButton from "@/components/ui/MysticalButton";

interface RepositoryListProps {
    repos: GitHubRepo[];
    onRepoClick?: (repo: GitHubRepo) => void;
    className?: string;
}

type SortField = "stars" | "updated" | "name";
type SortOrder = "asc" | "desc";

export default function RepositoryList({ repos, onRepoClick, className = "" }: RepositoryListProps) {
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>("updated");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [langFilter, setLangFilter] = useState<string>("All");

    // Extract unique languages for filter
    const languages = useMemo(() => {
        const langs = new Set<string>();
        repos.forEach((r) => {
            if (r.language) langs.add(r.language);
        });
        return ["All", ...Array.from(langs).sort()];
    }, [repos]);

    // Filter and sort logic
    const filteredRepos = useMemo(() => {
        return repos
            .filter((repo) => {
                const matchesSearch =
                    repo.name.toLowerCase().includes(search.toLowerCase()) ||
                    (repo.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
                const matchesLang = langFilter === "All" || repo.language === langFilter;
                return matchesSearch && matchesLang;
            })
            .sort((a, b) => {
                let comparison = 0;
                if (sortField === "stars") {
                    comparison = b.stargazers_count - a.stargazers_count;
                } else if (sortField === "updated") {
                    comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                } else if (sortField === "name") {
                    comparison = a.name.localeCompare(b.name);
                }

                return sortOrder === "asc" ? -comparison : comparison;
            });
    }, [repos, search, sortField, sortOrder, langFilter]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("desc");
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-72">
                    <MysticalInput
                        placeholder="Search repositories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClear={() => setSearch("")}
                        className="w-full"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {/* Language Filter */}
                    <div className="relative shrink-0">
                        <select
                            value={langFilter}
                            onChange={(e) => setLangFilter(e.target.value)}
                            className="appearance-none bg-card/60 border border-white/10 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-foreground/70 focus:outline-none focus:border-cyan-primary/50 transition-colors cursor-pointer"
                        >
                            {languages.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                    </div>

                    {/* Sort Buttons */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        <SortButton
                            label="Stars"
                            active={sortField === "stars"}
                            order={sortOrder}
                            onClick={() => toggleSort("stars")}
                        />
                        <SortButton
                            label="Updated"
                            active={sortField === "updated"}
                            order={sortOrder}
                            onClick={() => toggleSort("updated")}
                        />
                        <SortButton
                            label="Name"
                            active={sortField === "name"}
                            order={sortOrder}
                            onClick={() => toggleSort("name")}
                        />
                    </div>
                </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between px-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/30">
                    Showing {filteredRepos.length} repositories
                    {langFilter !== "All" && ` in ${langFilter}`}
                    {search && ` matching "${search}"`}
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredRepos.map((repo) => (
                        <motion.div
                            key={repo.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <RepositoryCard
                                repo={repo}
                                onClick={() => onRepoClick?.(repo)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredRepos.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-foreground/40 text-sm">No repositories match your criteria.</p>
                </div>
            )}
        </div>
    );
}

function SortButton({
    label,
    active,
    order,
    onClick
}: {
    label: string;
    active: boolean;
    order: SortOrder;
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${active
                ? "bg-cyan-primary text-background shadow-[0_0_12px_rgba(0,255,255,0.4)]"
                : "text-foreground/40 hover:text-foreground/70 hover:bg-white/5"
                }`}
        >
            {label}
            {active && (
                order === "asc" ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />
            )}
        </button>
    );
}
