"use client";

import { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
type GlowColor = "cyan" | "teal" | "purple" | "gold" | "white" | string;
type GlowIntensity = "subtle" | "medium" | "strong" | "intense";
type GlowVariant = "radial" | "pulse" | "ring" | "spotlight" | "border";

interface MysticalGlowProps {
    /** The element(s) to wrap */
    children?: ReactNode;
    color?: GlowColor;
    intensity?: GlowIntensity;
    variant?: GlowVariant;
    /** Animate? (defaults true for pulse, ring) */
    animate?: boolean;
    className?: string;
    style?: CSSProperties;
    /** For standalone decorative glow blobs — no children required */
    standalone?: boolean;
    /** Width / height when standalone */
    size?: number | string;
    as?: keyof JSX.IntrinsicElements;
}

/* ─────────────────────────────────────────────────────────────────
   Color maps
───────────────────────────────────────────────────────────────── */
const COLOR_MAP: Record<string, { raw: string; mid: string; dim: string }> = {
    cyan: { raw: "#00FFFF", mid: "rgba(0,255,255,0.4)", dim: "rgba(0,255,255,0.1)" },
    teal: { raw: "#008B8B", mid: "rgba(0,139,139,0.4)", dim: "rgba(0,139,139,0.1)" },
    purple: { raw: "#A855F7", mid: "rgba(168,85,247,0.4)", dim: "rgba(168,85,247,0.1)" },
    gold: { raw: "#F59E0B", mid: "rgba(245,158,11,0.4)", dim: "rgba(245,158,11,0.1)" },
    white: { raw: "#FFFFFF", mid: "rgba(255,255,255,0.3)", dim: "rgba(255,255,255,0.08)" },
};

const INTENSITY_SCALE: Record<GlowIntensity, number> = {
    subtle: 0.25,
    medium: 0.45,
    strong: 0.65,
    intense: 0.9,
};

function resolveColor(color: GlowColor) {
    return COLOR_MAP[color] ?? {
        raw: color,
        mid: color,
        dim: color,
    };
}

/* ─────────────────────────────────────────────────────────────────
   Variant renderers
───────────────────────────────────────────────────────────────── */

/** radial — plain background glow around children */
function RadialGlow({ children, colorObj, scale, className, style }: any) {
    return (
        <div
            className={`relative ${className}`}
            style={{
                ...style,
                filter: `drop-shadow(0 0 ${20 * scale}px ${colorObj.mid})`,
            }}
        >
            {children}
        </div>
    );
}

/** pulse — pulsing box-shadow ring */
function PulseGlow({ children, colorObj, scale, animate: anim, className, style }: any) {
    const shadow = `0 0 ${30 * scale}px ${colorObj.mid}`;
    return (
        <motion.div
            className={`relative ${className}`}
            style={style}
            animate={anim ? { boxShadow: [shadow, `0 0 ${55 * scale}px ${colorObj.mid}`, shadow] } : undefined}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            {children}
        </motion.div>
    );
}

/** ring — animated outline ring */
function RingGlow({ children, colorObj, scale, animate: anim, className, style }: any) {
    return (
        <div className={`relative inline-flex ${className}`} style={style}>
            {children}
            <motion.span
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{ border: `1px solid ${colorObj.raw}` }}
                animate={anim ? { opacity: [0.6, 0.15, 0.6], scale: [1, 1.04, 1] } : undefined}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

/** spotlight — conic beam from top */
function SpotlightGlow({ children, colorObj, scale, className, style }: any) {
    return (
        <div className={`relative ${className}`} style={style}>
            <div
                className="pointer-events-none absolute -top-px left-1/2 -translate-x-1/2 w-40 h-32 opacity-60"
                style={{
                    background: `conic-gradient(from 270deg at 50% 0%, ${colorObj.dim}, ${colorObj.raw}, ${colorObj.dim})`,
                    maskImage: "linear-gradient(to bottom, white 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, white 0%, transparent 100%)",
                    filter: `blur(${6 * scale}px)`,
                }}
            />
            {children}
        </div>
    );
}

/** border — glowing border that breathes */
function BorderGlow({ children, colorObj, scale, animate: anim, className, style }: any) {
    return (
        <motion.div
            className={`relative rounded-2xl ${className}`}
            style={{
                ...style,
                border: `1px solid ${colorObj.raw}`,
                boxShadow: `0 0 ${14 * scale}px ${colorObj.dim}, inset 0 0 ${8 * scale}px ${colorObj.dim}`,
            }}
            animate={anim ? {
                boxShadow: [
                    `0 0 ${14 * scale}px ${colorObj.dim}, inset 0 0 ${8 * scale}px ${colorObj.dim}`,
                    `0 0 ${30 * scale}px ${colorObj.mid}, inset 0 0 ${16 * scale}px ${colorObj.dim}`,
                    `0 0 ${14 * scale}px ${colorObj.dim}, inset 0 0 ${8 * scale}px ${colorObj.dim}`,
                ],
            } : undefined}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Main export
───────────────────────────────────────────────────────────────── */
export default function MysticalGlow({
    children,
    color = "cyan",
    intensity = "medium",
    variant = "radial",
    animate: anim = true,
    className = "",
    style,
    standalone = false,
    size = 300,
}: MysticalGlowProps) {
    const colorObj = resolveColor(color);
    const scale = INTENSITY_SCALE[intensity];

    if (standalone) {
        return (
            <motion.div
                className={`pointer-events-none select-none ${className}`}
                style={{
                    width: size,
                    height: size,
                    background: `radial-gradient(circle, ${colorObj.mid} 0%, transparent 70%)`,
                    ...style,
                }}
                animate={anim ? { scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] } : undefined}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
        );
    }

    const props = { children, colorObj, scale, animate: anim, className, style };

    switch (variant) {
        case "pulse": return <PulseGlow     {...props} />;
        case "ring": return <RingGlow      {...props} />;
        case "spotlight": return <SpotlightGlow {...props} />;
        case "border": return <BorderGlow    {...props} />;
        default: return <RadialGlow    {...props} />;
    }
}
