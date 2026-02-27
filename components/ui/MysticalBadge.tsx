"use client";

import { motion } from "framer-motion";

type ScoreGrade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
type BadgeSize = "sm" | "md";

interface MysticalBadgeProps {
    grade: ScoreGrade;
    size?: BadgeSize;
    /** Disable the pulse animation */
    noPulse?: boolean;
    className?: string;
}

const gradeColors: Record<ScoreGrade, { bg: string; border: string; text: string; glow: string }> = {
    "A+": {
        bg: "rgba(0,255,255,0.12)",
        border: "rgba(0,255,255,0.6)",
        text: "#00FFFF",
        glow: "rgba(0,255,255,0.5)",
    },
    A: {
        bg: "rgba(0,220,210,0.12)",
        border: "rgba(0,220,210,0.5)",
        text: "#00DCD2",
        glow: "rgba(0,220,210,0.4)",
    },
    "B+": {
        bg: "rgba(80,200,120,0.12)",
        border: "rgba(80,200,120,0.5)",
        text: "#50C878",
        glow: "rgba(80,200,120,0.35)",
    },
    B: {
        bg: "rgba(100,200,100,0.1)",
        border: "rgba(100,200,100,0.4)",
        text: "#7DD87D",
        glow: "rgba(100,200,100,0.3)",
    },
    "C+": {
        bg: "rgba(255,200,50,0.1)",
        border: "rgba(255,200,50,0.4)",
        text: "#F5C842",
        glow: "rgba(255,200,50,0.3)",
    },
    C: {
        bg: "rgba(255,165,0,0.1)",
        border: "rgba(255,165,0,0.4)",
        text: "#FFA500",
        glow: "rgba(255,165,0,0.3)",
    },
    D: {
        bg: "rgba(255,100,50,0.1)",
        border: "rgba(255,100,50,0.4)",
        text: "#FF6432",
        glow: "rgba(255,100,50,0.3)",
    },
    F: {
        bg: "rgba(220,50,50,0.1)",
        border: "rgba(220,50,50,0.4)",
        text: "#DC3232",
        glow: "rgba(220,50,50,0.3)",
    },
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: "text-xs px-2 py-0.5 rounded-md font-bold min-w-[36px]",
    md: "text-sm px-3 py-1 rounded-lg font-bold min-w-[48px]",
};

export default function MysticalBadge({
    grade,
    size = "md",
    noPulse = false,
    className = "",
}: MysticalBadgeProps) {
    const colors = gradeColors[grade];

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            {/* Pulse ring */}
            {!noPulse && (
                <motion.span
                    className="absolute inset-0 rounded-lg"
                    animate={{
                        boxShadow: [
                            `0 0 0 0px ${colors.glow}`,
                            `0 0 0 6px rgba(0,0,0,0)`,
                        ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
            )}

            <motion.span
                whileHover={{ scale: 1.08 }}
                className={[
                    "relative inline-flex items-center justify-center border text-center select-none",
                    sizeStyles[size],
                ].join(" ")}
                style={{
                    background: colors.bg,
                    borderColor: colors.border,
                    color: colors.text,
                    boxShadow: `0 0 10px ${colors.glow}`,
                }}
            >
                {grade}
            </motion.span>
        </div>
    );
}
