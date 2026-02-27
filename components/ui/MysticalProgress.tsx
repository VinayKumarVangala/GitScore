"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";

/* ─────────────── Circular Progress ─────────────── */
interface CircularProgressProps {
    value: number;       // 0–100
    size?: number;       // px
    strokeWidth?: number;
    label?: string;
    showPercent?: boolean;
}

export function CircularProgress({
    value,
    size = 120,
    strokeWidth = 8,
    label,
    showPercent = true,
}: CircularProgressProps) {
    const clamp = Math.min(100, Math.max(0, value));
    const r = (size - strokeWidth * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (clamp / 100) * circ;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="rgba(0,255,255,0.08)"
                    strokeWidth={strokeWidth}
                />
                {/* Fill */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="url(#cyan-gradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ filter: "drop-shadow(0 0 6px rgba(0,255,255,0.6))" }}
                />
                <defs>
                    <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00FFFF" />
                        <stop offset="100%" stopColor="#008B8B" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showPercent && (
                    <AnimatedNumber
                        value={clamp}
                        className="text-xl font-bold text-cyan-primary leading-none"
                        suffix="%"
                    />
                )}
                {label && (
                    <span className="text-[10px] text-foreground/50 mt-0.5">{label}</span>
                )}
            </div>
        </div>
    );
}

/* ─────────────── Linear Progress ─────────────── */
interface LinearProgressProps {
    value: number;        // 0–100
    label?: string;
    showValue?: boolean;
    height?: number;
    color?: string;
}

export function LinearProgress({
    value,
    label,
    showValue = true,
    height = 6,
    color,
}: LinearProgressProps) {
    const clamp = Math.min(100, Math.max(0, value));

    return (
        <div className="w-full">
            {(label || showValue) && (
                <div className="flex items-center justify-between mb-1.5">
                    {label && (
                        <span className="text-xs text-foreground/60">{label}</span>
                    )}
                    {showValue && (
                        <AnimatedNumber
                            value={clamp}
                            className="text-xs font-semibold text-cyan-primary"
                            suffix="%"
                        />
                    )}
                </div>
            )}

            <div
                className="w-full rounded-full overflow-hidden"
                style={{
                    height,
                    background: "rgba(0,255,255,0.08)",
                }}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clamp}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                        background: color ?? "linear-gradient(90deg, #00FFFF 0%, #008B8B 100%)",
                        boxShadow: "0 0 8px rgba(0,255,255,0.5)",
                    }}
                />
            </div>
        </div>
    );
}

/* ─────────────── Animated number counter ─────────────── */
function AnimatedNumber({
    value,
    suffix = "",
    className = "",
}: {
    value: number;
    suffix?: string;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionVal = useMotionValue(0);
    const spring = useSpring(motionVal, { stiffness: 100, damping: 20 });

    useEffect(() => {
        const ctrl = animate(motionVal, value, { duration: 1.2, ease: "easeOut" });
        return ctrl.stop;
    }, [value, motionVal]);

    useEffect(() => {
        return spring.on("change", (v) => {
            if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
        });
    }, [spring, suffix]);

    return (
        <span ref={ref} className={className}>
            0{suffix}
        </span>
    );
}
