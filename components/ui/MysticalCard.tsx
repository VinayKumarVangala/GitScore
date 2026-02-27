"use client";

import { ReactNode, HTMLAttributes } from "react";
import { motion } from "framer-motion";

type CardVariant = "default" | "interactive" | "score-card";

interface MysticalCardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
    glowIntensity?: "none" | "low" | "medium" | "high";
    padding?: "none" | "sm" | "md" | "lg";
    children: ReactNode;
}

const paddingMap = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
};

const glowMap = {
    none: "rgba(0,255,255,0)",
    low: "rgba(0,255,255,0.12)",
    medium: "rgba(0,255,255,0.25)",
    high: "rgba(0,255,255,0.45)",
};

export default function MysticalCard({
    variant = "default",
    glowIntensity = "none",
    padding = "md",
    children,
    className = "",
    onClick,
    ...rest
}: MysticalCardProps) {
    const isInteractive = variant === "interactive" || !!onClick;
    const isScoreCard = variant === "score-card";

    const card = (
        <div
            className={[
                "relative rounded-2xl border transition-all duration-300",
                paddingMap[padding],
                isScoreCard
                    ? "border-cyan-primary/30 bg-card/60"
                    : "border-foreground/8 bg-card/70",
                "backdrop-blur-md",
                isInteractive ? "cursor-pointer" : "",
                className,
            ].join(" ")}
            style={{
                boxShadow: glowIntensity !== "none"
                    ? `0 0 32px ${glowMap[glowIntensity]}, inset 0 1px 0 rgba(255,255,255,0.04)`
                    : "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            onClick={onClick}
            {...rest}
        >
            {/* Score card top accent line */}
            {isScoreCard && (
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-primary/60 to-transparent rounded-full" />
            )}
            {children}
        </div>
    );

    if (isInteractive) {
        return (
            <motion.div
                whileHover={{
                    scale: 1.015,
                    boxShadow: `0 0 40px ${glowMap["medium"]}`,
                }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
                style={{ borderRadius: "1rem" }}
            >
                {card}
            </motion.div>
        );
    }

    return card;
}
