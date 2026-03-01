"use client";

import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from "chart.js";
import MysticalCard from "@/components/ui/MysticalCard";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface LanguageChartProps {
    languages: { name: string; percentage: number }[];
    className?: string;
}

export default function LanguageChart({ languages, className = "" }: LanguageChartProps) {
    const chartData: ChartData<"doughnut"> = useMemo(() => {
        // Mystical color palette
        const colors = [
            "rgba(0, 255, 255, 0.8)",   // Cyan
            "rgba(0, 139, 139, 0.8)",   // Deep Cyan
            "rgba(168, 85, 247, 0.8)", // Purple
            "rgba(52, 211, 153, 0.8)", // Emerald
            "rgba(245, 158, 11, 0.8)", // Gold
            "rgba(255, 255, 255, 0.6)", // White
        ];

        return {
            labels: languages.map(l => l.name),
            datasets: [
                {
                    data: languages.map(l => l.percentage),
                    backgroundColor: colors,
                    borderColor: "rgba(10, 15, 30, 0.5)",
                    borderWidth: 2,
                    hoverOffset: 15,
                    spacing: 5,
                },
            ],
        };
    }, [languages]);

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "rgba(255, 255, 255, 0.5)",
                    font: {
                        size: 10,
                        family: "'Inter', sans-serif",
                        weight: "bold",
                    },
                    padding: 10,
                    usePointStyle: true,
                    pointStyle: "circle",
                },
            },
            tooltip: {
                backgroundColor: "rgba(21, 31, 46, 0.9)",
                titleColor: "#00FFFF",
                bodyColor: "rgba(255, 255, 255, 0.8)",
                borderColor: "rgba(0, 255, 255, 0.2)",
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        const value = context.parsed;
                        return ` ${value}%`;
                    },
                },
            },
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 2000,
            easing: "easeOutQuart",
        },
    };

    return (
        <MysticalCard className={`flex flex-col h-full ${className}`}>
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Language Distribution</h3>
                    <p className="text-[10px] text-foreground/40 font-bold uppercase mt-0.5">Primary stacks & technologies</p>
                </div>
            </div>

            <div className="flex-1 p-6 flex items-center justify-center relative min-h-[240px]">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-32 rounded-full border border-cyan-primary/5 bg-cyan-primary/5 blur-xl animate-pulse" />
                </div>

                <Doughnut data={chartData} options={options} />
            </div>

            {/* Bottom Info Bar */}
            <div className="p-4 border-t border-white/5 bg-slate-900/30 flex items-center justify-between">
                <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Top Stack</span>
                <span className="text-sm font-black text-cyan-primary tracking-tight">
                    {languages[0]?.name || "N/A"} ({languages[0]?.percentage || 0}%)
                </span>
            </div>
        </MysticalCard>
    );
}
