"use client";

import { useMemo } from "react";
import { Radar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from "chart.js";
import MysticalCard from "@/components/ui/MysticalCard";
import { DetailedScorecard } from "@/lib/github/types";

// Register ChartJS components for Radar
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface MysticalAuraProps {
    scorecard: DetailedScorecard;
    className?: string;
}

export default function MysticalAura({ scorecard, className = "" }: MysticalAuraProps) {
    const { dimensions } = scorecard;

    const chartData: ChartData<"radar"> = useMemo(() => {
        const labels = [
            dimensions.activity.label,
            dimensions.repositories.label,
            dimensions.community.label,
            dimensions.consistency.label
        ];

        const values = [
            dimensions.activity.score,
            dimensions.repositories.score,
            dimensions.community.score,
            dimensions.consistency.score
        ];

        return {
            labels,
            datasets: [
                {
                    label: "Profile Aura",
                    data: values,
                    backgroundColor: "rgba(0, 255, 255, 0.2)",
                    borderColor: "#00FFFF",
                    borderWidth: 2,
                    pointBackgroundColor: "#00FFFF",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "#00FFFF",
                    fill: true,
                }
            ]
        };
    }, [dimensions]);

    const options: ChartOptions<"radar"> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: {
                    color: "rgba(255, 255, 255, 0.05)",
                },
                grid: {
                    color: "rgba(255, 255, 255, 0.05)",
                },
                pointLabels: {
                    color: "rgba(255, 255, 255, 0.5)",
                    font: {
                        size: 10,
                        family: "'Inter', sans-serif",
                        weight: "bold",
                    },
                },
                ticks: {
                    display: false,
                    stepSize: 20,
                },
                suggestedMin: 0,
                suggestedMax: 100,
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: "rgba(21, 31, 46, 0.9)",
                titleColor: "#00FFFF",
                bodyColor: "rgba(255, 255, 255, 0.8)",
                borderColor: "rgba(0, 255, 255, 0.2)",
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
            }
        }
    };

    return (
        <MysticalCard className={`flex flex-col h-full bg-slate-900/50 ${className}`}>
            <div className="p-5 border-b border-white/5">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Mystical Aura</h3>
                <p className="text-[10px] text-foreground/40 font-bold uppercase mt-0.5">Profile dimensional equilibrium</p>
            </div>

            <div className="flex-1 p-2 relative min-h-[200px] max-h-[280px] flex items-center justify-center">
                {/* Glow behind radar */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    <div className="w-1/2 h-1/2 rounded-full bg-cyan-primary blur-[40px]" />
                </div>

                <div className="w-full h-full max-w-[250px] max-h-[250px]">
                    <Radar data={chartData} options={options} />
                </div>
            </div>

            <div className="p-3 border-t border-white/5 mt-auto">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-primary shadow-[0_0_8px_#00FFFF]" />
                        <span className="text-[10px] text-foreground/60 font-medium">Activity Balance</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-deep" />
                        <span className="text-[10px] text-foreground/60 font-medium">Community Impact</span>
                    </div>
                </div>
            </div>
        </MysticalCard>
    );
}
