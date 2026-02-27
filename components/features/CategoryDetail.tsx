"use client";

import { motion } from "framer-motion";
import { FiArrowLeft, FiCircle, FiCheckCircle, FiZap, FiCode, FiUsers, FiUser } from "react-icons/fi";
import MysticalCard from "@/components/ui/MysticalCard";
import { LinearProgress } from "@/components/ui/MysticalProgress";
import { DetailedScorecard, ScoringSubResult } from "@/lib/github/types";

interface CategoryDetailProps {
    scorecard: DetailedScorecard;
    categoryId: string;
    onBack: () => void;
    className?: string;
}

export default function CategoryDetail({ scorecard, categoryId, onBack, className = "" }: CategoryDetailProps) {
    const rawData = scorecard.raw as any;
    const categoryData = rawData[categoryId] as ScoringSubResult;

    if (!categoryData) return null;

    const { title, icon } = getCategoryMeta(categoryId);
    const breakdownEntries = Object.entries(categoryData.breakdown);

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-foreground/50 hover:text-cyan-primary transition-colors mb-4 group"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest">Back to Overview</span>
            </button>

            {/* Header Card */}
            <MysticalCard className="overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-cyan-primary/10 text-cyan-primary">
                                {icon}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">{title}</h2>
                                <p className="text-sm text-foreground/50">Comprehensive metric breakdown</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black text-cyan-primary">{categoryData.score}</div>
                            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Total Points</div>
                        </div>
                    </div>

                    <LinearProgress value={(categoryData.score / categoryData.maxScore) * 100} height={8} showValue={false} />
                    <div className="mt-2 text-[10px] text-foreground/30 text-right uppercase tracking-widest">
                        {categoryData.score} of {categoryData.maxScore} possible points
                    </div>
                </div>
            </MysticalCard>

            {/* Breakdown List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {breakdownEntries.map(([key, data]: [string, any], idx) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05, duration: 0.4 }}
                    >
                        <div className="bg-card/40 backdrop-blur-md rounded-xl p-4 border border-foreground/5 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="text-cyan-primary/50">
                                        {data.pts === data.maxPts ? <FiCheckCircle size={14} /> : <FiCircle size={14} />}
                                    </div>
                                    <h4 className="text-sm font-bold text-white/90 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </h4>
                                </div>
                                <div className="text-xs font-mono text-cyan-primary">
                                    {data.pts}/{data.maxPts}
                                </div>
                            </div>

                            {data.detail && (
                                <p className="text-xs text-foreground/50 mb-4">{data.detail}</p>
                            )}

                            <div className="mt-auto">
                                <div className="h-1 w-full bg-foreground/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(data.pts / data.maxPts) * 100}%` }}
                                        className="h-full bg-cyan-primary/60"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function getCategoryMeta(id: string) {
    switch (id) {
        case "activity":
            return { title: "Activity & Consistency", icon: <FiZap size={24} /> };
        case "codeQuality":
        case "repositories":
            return { title: "Code Quality & Hygiene", icon: <FiCode size={24} /> };
        case "community":
            return { title: "Community & Impact", icon: <FiUsers size={24} /> };
        case "profile":
            return { title: "Profile Completeness", icon: <FiUser size={24} /> };
        default:
            return { title: "Category Breakdown", icon: <FiArrowLeft size={24} /> };
    }
}
