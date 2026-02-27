"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiExternalLink, FiCode, FiAlertCircle, FiCheckCircle, FiInfo, FiTag, FiFileText } from "react-icons/fi";
import { GitHubRepo } from "@/lib/github/types";
import MysticalCard from "@/components/ui/MysticalCard";
import MysticalButton from "@/components/ui/MysticalButton";
import MysticalBadge from "@/components/ui/MysticalBadge";

interface RepoQuickViewProps {
    repo: GitHubRepo | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function RepoQuickView({ repo, isOpen, onClose }: RepoQuickViewProps) {
    if (!repo) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden"
                    >
                        <MysticalCard className="h-full flex flex-col border-white/20">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-cyan-primary/10 text-cyan-primary">
                                        <FiCode size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{repo.name}</h2>
                                        <p className="text-xs text-foreground/40">{repo.full_name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 text-foreground/40 hover:text-white transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                                {/* Description */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mb-2">Description</h4>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        {repo.description || "No description provided for this repository."}
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <StatItem label="Stars" value={repo.stargazers_count} />
                                    <StatItem label="Forks" value={repo.forks_count} />
                                    <StatItem label="Issues" value={repo.open_issues_count} />
                                    <StatItem label="Size" value={`${(repo.size / 1024).toFixed(1)} MB`} />
                                </div>

                                {/* Topics */}
                                {repo.topics && repo.topics.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mb-3">Topics</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {repo.topics.map((topic) => (
                                                <span
                                                    key={topic}
                                                    className="px-2.5 py-1 rounded-lg bg-cyan-primary/5 border border-cyan-primary/20 text-cyan-primary text-[10px] font-bold hover:bg-cyan-primary/10 transition-colors"
                                                >
                                                    <FiTag className="inline mr-1" size={10} /> {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* License & Visibility */}
                                <div className="flex flex-wrap gap-6">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mb-2">License</h4>
                                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                                            <FiFileText className="text-foreground/40" />
                                            {repo.license ? repo.license.name : "No License"}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mb-2">Visibility</h4>
                                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-bold capitalize">
                                            {repo.visibility}
                                        </div>
                                    </div>
                                </div>

                                {/* README Preview Placeholder */}
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
                                    <FiAlertCircle className="mx-auto mb-3 text-foreground/20" size={32} />
                                    <p className="text-xs text-foreground/40 italic">
                                        Full README analysis and preview would be available here in the main scoring flow.
                                    </p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                                <MysticalButton variant="ghost" size="sm" onClick={onClose}>
                                    Close
                                </MysticalButton>
                                <MysticalButton
                                    variant="primary"
                                    size="sm"
                                    onClick={() => window.open(repo.html_url, "_blank")}
                                    className="gap-2"
                                >
                                    View on GitHub <FiExternalLink size={14} />
                                </MysticalButton>
                            </div>
                        </MysticalCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-sm font-bold text-white">{value}</div>
        </div>
    );
}
