"use client";

import { useRef } from "react";
import { useParticles, ParticleConfig } from "@/hooks/useParticles";

interface ParticleFieldProps extends ParticleConfig {
    /** Tailwind / inline className for the wrapper div */
    className?: string;
    /** z-index for the canvas layer */
    zIndex?: number;
    /** Opacity of the whole field (0–1) */
    opacity?: number;
}

/**
 * Drop-in canvas particle field.
 *
 * Usage:
 *   <ParticleField className="absolute inset-0" count={60} />
 */
export default function ParticleField({
    className = "",
    zIndex = 0,
    opacity = 1,
    ...config
}: ParticleFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useParticles({ canvasRef, ...config });

    return (
        <div
            className={`overflow-hidden ${className}`}
            style={{ zIndex, opacity, pointerEvents: "none" }}
            aria-hidden
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ display: "block" }}
            />
        </div>
    );
}
