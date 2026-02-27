"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiChevronDown,
    FiChevronUp,
    FiCheck,
    FiExternalLink,
    FiClock,
    FiZap,
} from "react-icons/fi";
import { GeneratedRecommendation, GeneratorOutput } from "@/lib/recommendations/generator";
import { DIFFICULTY_COLOURS, DIFFICULTY_LABELS } from "@/lib/recommendations/score-based";

const LS_KEY = "gitscore:completed-recommendations";

function loadCompleted(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
        const raw = localStorage.getItem(LS_KEY);
        return new Set(raw ? JSON.parse(raw) : []);
    } catch {
        return new Set();
    }
}

function saveCompleted(ids: Set<string>) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(Array.from(ids)));
    } catch { }
}

/* ── Tier accent colours ──────────────────────────────────────────────────── */
const TIER_ACCENT: Record<string, string> = {
    red: "rgba(248,113,113,",
    amber: "rgba(251,191,36,",
    cyan: "rgba(0,255,255,",
    emerald: "rgba(52,211,153,",
};

function tierGlow(accent: string, alpha: number) {
    const base = TIER_ACCENT[accent] ?? "rgba(0,255,255,";
    return `${base}${alpha})`;
}

/* ── Single recommendation card ──────────────────────────────────────────── */
interface RecommendationCardProps {
    rec: GeneratedRecommendation;
    isCompleted: boolean;
    onToggle: (id: string) => void;
}

function RecommendationCard({ rec, isCompleted, onToggle }: RecommendationCardProps) {
    const [expanded, setExpanded] = useState(false);

    const borderColor = isCompleted ? "rgba(52,211,153,0.3)" : tierGlow(rec.accentColor, 0.3);
    const glowColor = isCompleted ? "rgba(52,211,153,0.08)" : tierGlow(rec.accentColor, 0.06);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: isCompleted ? 0.6 : 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden"
            style={{ borderColor, background: glowColor }}
        >
            {/* Header row */}
            <div className="flex items-start gap-3 p-4 sm:p-5">
                {/* Priority badge */}
                <div
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-background"
                    style={{ background: `linear-gradient(135deg, #00FFFF, #008B8B)` }}
                >
                    {rec.priority}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3
                            className="font-semibold text-sm"
                            style={{ textDecoration: isCompleted ? "line-through" : "none" }}
                        >
                            {rec.title}
                        </h3>
                        {/* Difficulty pill */}
                        <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOURS[rec.difficulty]}`}
                        >
                            {DIFFICULTY_LABELS[rec.difficulty]}
                        </span>
                    </div>

                    <p className="text-xs text-foreground/50 line-clamp-2">{rec.description}</p>

                    {rec.personalNote && !isCompleted && (
                        <p
                            className="mt-1.5 text-xs px-2 py-1 rounded-lg"
                            style={{
                                background: tierGlow(rec.accentColor, 0.08),
                                color: "rgba(255,255,255,0.7)",
                                borderLeft: `2px solid ${tierGlow(rec.accentColor, 0.6)}`,
                            }}
                        >
                            {rec.personalNote}
                        </p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-2">
                        {rec.timeEstimate > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-foreground/40">
                                <FiClock size={10} /> {rec.timeEstimate} min
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] text-foreground/40">
                            <FiZap size={10} /> up to {rec.maxImpact} pts
                        </span>
                        <span className="text-[10px] text-foreground/40 capitalize">{rec.category}</span>
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                    {/* Mark done */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => onToggle(rec.id)}
                        className={[
                            "w-7 h-7 rounded-full border flex items-center justify-center transition-colors",
                            isCompleted
                                ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-400"
                                : "bg-transparent border-foreground/20 text-foreground/30 hover:border-cyan-primary/50 hover:text-cyan-primary",
                        ].join(" ")}
                        title={isCompleted ? "Mark as not done" : "Mark as done"}
                    >
                        <FiCheck size={13} />
                    </motion.button>

                    {/* Expand */}
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="text-foreground/40 hover:text-cyan-primary transition-colors p-1"
                    >
                        {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* Expanded content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        key="details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div
                            className="px-4 sm:px-5 pb-5 pt-2"
                            style={{ borderTop: `1px solid ${tierGlow(rec.accentColor, 0.15)}` }}
                        >
                            {/* Steps */}
                            <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2.5">
                                Action Steps
                            </h4>
                            <ol className="space-y-1.5 mb-4">
                                {rec.steps.map((step, i) => (
                                    <li key={i} className="flex gap-2.5 text-xs text-foreground/70">
                                        <span
                                            className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-background mt-0.5"
                                            style={{ background: tierGlow(rec.accentColor, 0.8) }}
                                        >
                                            {i + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ol>

                            {/* Resources */}
                            {rec.resources.length > 0 && (
                                <>
                                    <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                                        Resources
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {rec.resources.map((r) => (
                                            <a
                                                key={r.url}
                                                href={r.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-cyan-primary border border-cyan-primary/30 rounded-lg px-2.5 py-1 hover:bg-cyan-primary/10 transition-colors"
                                            >
                                                {r.label} <FiExternalLink size={11} />
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ── Main list component ──────────────────────────────────────────────────── */
interface RecommendationsListProps {
    output: GeneratorOutput;
    /** Called when completed ids change (so parent can re-generate) */
    onCompletedChange?: (ids: string[]) => void;
}

export default function RecommendationsList({
    output,
    onCompletedChange,
}: RecommendationsListProps) {
    const { tier, recommendations, maxRecoverable } = output;
    const [completed, setCompleted] = useState<Set<string>>(new Set());

    // Hydrate from localStorage after mount
    useEffect(() => {
        setCompleted(loadCompleted());
    }, []);

    const toggleDone = useCallback((id: string) => {
        setCompleted((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            saveCompleted(next);
            onCompletedChange?.(Array.from(next));
            return next;
        });
    }, [onCompletedChange]);

    const completedCount = recommendations.filter((r) => completed.has(r.id)).length;
    const progress = recommendations.length > 0
        ? Math.round((completedCount / recommendations.length) * 100)
        : 0;

    const accentBase = TIER_ACCENT[tier.accent] ?? TIER_ACCENT.cyan;

    if (!recommendations.length) {
        return (
            <div className="text-center py-12 text-foreground/40">
                <p className="text-4xl mb-3">🎉</p>
                <p className="text-sm">All recommendations completed! Great work.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Tier header */}
            <div
                className="rounded-2xl p-4 border"
                style={{
                    borderColor: `${accentBase}0.25)`,
                    background: `${accentBase}0.05)`,
                }}
            >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <h2 className="font-bold text-base" style={{ color: `${accentBase}0.9)` }}>
                            {tier.label}
                        </h2>
                        <p className="text-xs text-foreground/50 mt-0.5">{tier.description}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-foreground/40">potential recovery</p>
                        <p
                            className="text-lg font-bold"
                            style={{ color: `${accentBase}0.9)` }}
                        >
                            +{maxRecoverable} pts
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                {completedCount > 0 && (
                    <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-foreground/40 mb-1">
                            <span>{completedCount}/{recommendations.length} completed</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, #00FFFF, #008B8B)` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Recommendation cards */}
            <div className="space-y-3">
                {recommendations.map((rec) => (
                    <RecommendationCard
                        key={rec.id}
                        rec={rec}
                        isCompleted={completed.has(rec.id)}
                        onToggle={toggleDone}
                    />
                ))}
            </div>
        </div>
    );
}
