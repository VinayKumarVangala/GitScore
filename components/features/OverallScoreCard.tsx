"use client";

import { motion } from "framer-motion";
import { CircularProgress } from "@/components/ui/MysticalProgress";
import MysticalBadge from "@/components/ui/MysticalBadge";
import MysticalCard from "@/components/ui/MysticalCard";
import MysticalGlow from "@/components/ui/MysticalGlow";
import { DetailedScorecard } from "@/lib/github/types";

interface OverallScoreCardProps {
    scorecard: DetailedScorecard;
    className?: string;
}

export default function OverallScoreCard({ scorecard, className = "" }: OverallScoreCardProps) {
    const { totalScore, grade, username } = scorecard;

    // Map score to a glow color
    const getScoreColor = (score: number) => {
        if (score >= 80) return "cyan";
        if (score >= 60) return "teal";
        if (score >= 40) return "gold";
        return "purple"; // Using purple for low scores as per mystical theme
    };

    const accentColor = getScoreColor(totalScore);

    return (
        <MysticalCard
            variant="default"
            glowIntensity="medium"
            className={`relative overflow-hidden ${className}`}
        >
            {/* Background Ambient Glow */}
            <MysticalGlow
                standalone
                color={accentColor}
                size={300}
                className="absolute -top-20 -right-20 opacity-30"
            />

            <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6"
                >
                    <div className="relative">
                        <CircularProgress
                            value={totalScore}
                            size={180}
                            strokeWidth={12}
                            showPercent={false}
                        />

                        {/* Inner score overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-4xl font-black text-white tracking-tighter"
                            >
                                {totalScore}
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="text-[10px] uppercase tracking-widest text-foreground font-bold"
                            >
                                Global Score
                            </motion.span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <MysticalBadge grade={grade} size="md" className="mb-4" />

                    <h2 className="text-xl font-bold text-white mb-2">
                        Analysis for <span className="text-cyan-primary">@{username}</span>
                    </h2>

                    <p className="text-sm text-foreground/60 max-w-xs">
                        Overall GitHub engineering evaluation based on activity, code quality, and community impact.
                    </p>
                </motion.div>

                {/* Decorative elements */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-primary/20 to-transparent" />
            </div>
        </MysticalCard>
    );
}
