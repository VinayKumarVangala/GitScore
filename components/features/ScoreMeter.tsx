"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import MysticalGlow from "@/components/ui/MysticalGlow";

interface ScoreMeterProps {
    score: number;
    size?: number;
    className?: string;
}

export default function ScoreMeter({ score, size = 300, className = "" }: ScoreMeterProps) {
    const [rotation, setRotation] = useState(-90);

    // Map score [0, 100] to rotation [-90, 90]
    useEffect(() => {
        const targetRotation = (score / 100) * 180 - 90;
        setRotation(targetRotation);
    }, [score]);

    const centerX = size / 2;
    const centerY = size * 0.75;
    const radius = size * 0.4;
    const strokeWidth = size * 0.08;

    // Gauge segments
    const segments = [
        { start: -90, end: -45, color: "#DC3232", label: "F" },      // F - D
        { start: -45, end: 0, color: "#FFA500", label: "C" },      // C
        { start: 0, end: 45, color: "#50C878", label: "B" },      // B
        { start: 45, end: 90, color: "#00FFFF", label: "A" },      // A+
    ];

    return (
        <div className={`relative flex flex-col items-center ${className}`} style={{ width: size, height: size * 0.8 }}>
            <svg width={size} height={size * 0.8} viewBox={`0 0 ${size} ${size * 0.8}`}>
                <defs>
                    <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Gauge Background Track */}
                <path
                    d={describeArc(centerX, centerY, radius, -95, 95)}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth + 4}
                    strokeLinecap="round"
                />

                {/* Colored Segments */}
                {segments.map((seg, i) => (
                    <path
                        key={i}
                        d={describeArc(centerX, centerY, radius, seg.start, seg.end)}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeOpacity={0.2}
                        strokeLinecap="butt"
                    />
                ))}

                {/* Active Progress Path */}
                <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: score / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    d={describeArc(centerX, centerY, radius, -90, 90)}
                    fill="none"
                    stroke="url(#meter-gradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 8px rgba(0,255,255,0.4))" }}
                />

                <defs>
                    <linearGradient id="meter-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#DC3232" />
                        <stop offset="50%" stopColor="#FFA500" />
                        <stop offset="80%" stopColor="#50C878" />
                        <stop offset="100%" stopColor="#00FFFF" />
                    </linearGradient>
                </defs>

                {/* Needle */}
                <motion.g
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 2, type: "spring", stiffness: 50, damping: 15 }}
                    style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
                >
                    {/* Needle Base */}
                    <circle cx={centerX} cy={centerY} r={strokeWidth / 2} fill="#00FFFF" style={{ filter: "url(#gauge-glow)" }} />

                    {/* Main Needle Line */}
                    <line
                        x1={centerX}
                        y1={centerY}
                        x2={centerX}
                        y2={centerY - radius - 10}
                        stroke="#00FFFF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ filter: "url(#gauge-glow)" }}
                    />

                    {/* Needle Tip Decoration */}
                    <path
                        d={`M ${centerX - 4} ${centerY - radius} L ${centerX + 4} ${centerY - radius} L ${centerX} ${centerY - radius - 15} Z`}
                        fill="#00FFFF"
                    />
                </motion.g>

                {/* Center Text */}
                <text
                    x={centerX}
                    y={centerY + 30}
                    textAnchor="middle"
                    className="text-3xl font-black fill-white"
                >
                    {score}
                </text>
                <text
                    x={centerX}
                    y={centerY + 50}
                    textAnchor="middle"
                    className="text-[10px] uppercase font-bold tracking-[0.2em] fill-foreground/40"
                >
                    Rating
                </text>
            </svg>

            {/* Ambient Glow behind the score */}
            <MysticalGlow
                standalone
                color="cyan"
                variant="radial"
                size={radius * 1.5}
                className="absolute bottom-0 opacity-20"
            />
        </div>
    );
}

// Utility to describe SVG arc path
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
