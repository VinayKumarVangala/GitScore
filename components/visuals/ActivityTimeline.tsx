"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import MysticalCard from "@/components/ui/MysticalCard";
import { ContributionSummary } from "@/lib/github/types";

interface ActivityTimelineProps {
    contribution: ContributionSummary;
    className?: string;
}

export default function ActivityTimeline({ contribution, className = "" }: ActivityTimelineProps) {
    // We'll create a simplified 12-week heatmap (84 days)
    const heatmapData = useMemo(() => {
        const dailyArr = Object.entries(contribution.dailyActivity)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .slice(0, 84); // Last 12 weeks

        return dailyArr.reverse();
    }, [contribution]);

    // Group into weeks (7 days each)
    const weeks = useMemo(() => {
        const result = [];
        for (let i = 0; i < heatmapData.length; i += 7) {
            result.push(heatmapData.slice(i, i + 7));
        }
        return result;
    }, [heatmapData]);

    const getColor = (count: number) => {
        if (count === 0) return "bg-white/5";
        if (count <= 2) return "bg-cyan-primary/20";
        if (count <= 5) return "bg-cyan-primary/40";
        if (count <= 10) return "bg-cyan-primary/70Shadow";
        return "bg-cyan-primary shadow-[0_0_8px_rgba(0,255,255,0.6)]";
    };

    return (
        <MysticalCard className={`flex flex-col ${className}`}>
            <div className="p-5 border-b border-white/5">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Activity Timeline</h3>
                <p className="text-[10px] text-foreground/40 font-bold uppercase mt-0.5">Commit pulse & contribution frequency</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Heatmap Section */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Last 12 Weeks</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-foreground/30 uppercase">Less</span>
                            {[0, 2, 5, 10, 15].map(v => (
                                <div key={v} className={`w-2 h-2 rounded-sm ${getColor(v)}`} />
                            ))}
                            <span className="text-[8px] text-foreground/30 uppercase">More</span>
                        </div>
                    </div>

                    <div className="flex gap-1 justify-between">
                        {weeks.map((week, wIdx) => (
                            <div key={wIdx} className="flex flex-col gap-1 flex-1">
                                {week.map((day, dIdx) => (
                                    <motion.div
                                        key={day[0]}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: (wIdx * 7 + dIdx) * 0.005, duration: 0.3 }}
                                        className={`aspect-square rounded-sm ${getColor(day[1])}`}
                                        title={`${day[0]}: ${day[1]} contributions`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Summary Row */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <div className="text-[10px] font-bold text-foreground/30 uppercase mb-1">Total Commits</div>
                        <div className="text-lg font-black text-white">{contribution.totalCommits}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <div className="text-[10px] font-bold text-foreground/30 uppercase mb-1">Active Days</div>
                        <div className="text-lg font-black text-white">{contribution.activeDays}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <div className="text-[10px] font-bold text-foreground/30 uppercase mb-1">Best Streak</div>
                        <div className="text-lg font-black text-cyan-primary">{contribution.longestStreak}d</div>
                    </div>
                </div>
            </div>
        </MysticalCard>
    );
}
