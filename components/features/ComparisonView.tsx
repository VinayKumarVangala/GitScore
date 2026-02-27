"use client";

import { motion } from "framer-motion";
import { FiZap, FiAward, FiTrendingUp, FiTrendingDown, FiMessageCircle } from "react-icons/fi";
import { DetailedScorecard } from "@/lib/github/types";
import { compareProfiles, ComparisonResult } from "@/lib/comparison/comparison-engine";
import MysticalCard from "@/components/ui/MysticalCard";
import MysticalBadge from "@/components/ui/MysticalBadge";
import { CircularProgress, LinearProgress } from "@/components/ui/MysticalProgress";

interface ComparisonViewProps {
    scorecard1: DetailedScorecard;
    scorecard2: DetailedScorecard;
    className?: string;
}

export default function ComparisonView({ scorecard1, scorecard2, className = "" }: ComparisonViewProps) {
    const result = compareProfiles(scorecard1, scorecard2);

    return (
        <div className={`space-y-12 ${className}`}>
            {/* Head-to-Head Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <UserBattleCard scorecard={scorecard1} isWinner={result.winner === scorecard1.username} />

                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-cyan-primary/10 border border-cyan-primary/30 flex items-center justify-center text-cyan-primary font-black italic text-xl shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                        VS
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Coordinate Battle</div>
                </div>

                <UserBattleCard scorecard={scorecard2} isWinner={result.winner === scorecard2.username} />
            </div>

            {/* Category Battleground */}
            <MysticalCard className="p-8">
                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                    <FiZap className="text-cyan-primary" /> Dimension Scrying
                </h3>

                <div className="space-y-10">
                    {result.differences.map((diff, idx) => {
                        const catKeys = Object.keys(scorecard1.dimensions) as (keyof typeof scorecard1.dimensions)[];
                        const catKey = catKeys[idx];
                        const score1 = scorecard1.dimensions[catKey].score;
                        const score2 = scorecard2.dimensions[catKey].score;
                        const max = 100; // Dimensions are normalized to 100

                        return (
                            <div key={diff.category} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{diff.category}</span>
                                    <span className="text-xs font-bold text-cyan-primary">Δ {diff.diff} pts</span>
                                </div>

                                <div className="relative h-4 flex items-center gap-4">
                                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(score1 / max) * 100}%` }}
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-primary to-cyan-deep rounded-full shadow-[0_0_10px_rgba(0,255,255,0.4)]"
                                        />
                                    </div>
                                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden relative flex justify-end">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(score2 / max) * 100}%` }}
                                            className="absolute inset-y-0 right-0 bg-gradient-to-l from-purple-500 to-purple-800 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                                        />
                                    </div>
                                    {/* Center Marker */}
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/10" />
                                </div>

                                <div className="flex justify-between text-xs font-black">
                                    <span className={diff.winner === scorecard1.username ? "text-cyan-primary font-black" : "text-foreground/20"}>{score1}</span>
                                    <span className={diff.winner === scorecard2.username ? "text-purple-400 font-black" : "text-foreground/20"}>{score2}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </MysticalCard>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.insights.map((insight, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-2xl border flex gap-4 items-start ${insight.type === 'positive' ? 'bg-cyan-primary/5 border-cyan-primary/20' :
                            insight.type === 'negative' ? 'bg-purple-500/5 border-purple-500/20' :
                                'bg-white/5 border-white/10'
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${insight.type === 'positive' ? 'text-cyan-primary bg-cyan-primary/10' :
                            insight.type === 'negative' ? 'text-purple-400 bg-purple-500/10' :
                                'text-foreground/40 bg-white/5'
                            }`}>
                            <FiMessageCircle size={16} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{insight.category}</div>
                            <p className="text-sm text-foreground/80 leading-relaxed font-medium">{insight.message}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function UserBattleCard({ scorecard, isWinner }: { scorecard: DetailedScorecard, isWinner: boolean }) {
    return (
        <MysticalCard className={`flex flex-col items-center text-center p-8 relative overflow-hidden transition-all duration-500 ${isWinner ? 'border-cyan-primary/50 shadow-[0_0_40px_rgba(0,255,255,0.15)]' : 'opacity-60 grayscale-[0.5]'}`}>
            {isWinner && (
                <div className="absolute top-4 right-4 text-cyan-primary">
                    <FiAward size={24} className="animate-bounce" />
                </div>
            )}

            <div className="relative mb-6">
                <CircularProgress value={scorecard.totalScore} size={120} strokeWidth={8} showPercent />
                <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-4">
                    <MysticalBadge grade={scorecard.grade} size="sm" />
                </div>
            </div>

            <div className="space-y-1">
                <h4 className="text-2xl font-black text-white truncate w-full">{scorecard.username}</h4>
                <p className="text-[10px] font-bold text-cyan-primary uppercase tracking-[0.2em]">Ranked Explorer</p>
            </div>

            {isWinner && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 px-4 py-1.5 rounded-full bg-cyan-primary text-background text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                >
                    Coordinate Winner
                </motion.div>
            )}
        </MysticalCard>
    );
}
