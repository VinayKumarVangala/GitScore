"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface MysticalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
    primary:
        "text-[#0A0F1E] font-semibold border border-cyan-primary/30",
    secondary:
        "text-cyan-primary font-semibold border border-cyan-primary/60 bg-transparent hover:bg-cyan-primary/10",
    ghost:
        "text-foreground/70 font-medium border border-transparent hover:text-cyan-primary hover:bg-cyan-primary/5",
};

const sizeStyles: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-md",
    md: "px-5 py-2.5 text-sm gap-2 rounded-lg",
    lg: "px-7 py-3.5 text-base gap-2.5 rounded-xl",
};

const glowStyles: Record<Variant, string> = {
    primary: "0 0 24px rgba(0,255,255,0.45)",
    secondary: "0 0 16px rgba(0,255,255,0.25)",
    ghost: "none",
};

function Spinner() {
    return (
        <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeOpacity="0.25"
            />
            <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function MysticalButton({
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled,
    leftIcon,
    rightIcon,
    children,
    className = "",
    ...rest
}: MysticalButtonProps) {
    const isPrimary = variant === "primary";

    return (
        <motion.button
            whileHover={!disabled && !isLoading ? { scale: 1.03 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.97 } : {}}
            onHoverStart={(_, info) => {
                if (disabled || isLoading) return;
                const el = (info as any).target as HTMLElement | null;
                if (el) el.style.boxShadow = glowStyles[variant];
            }}
            onHoverEnd={(_, info) => {
                const el = (info as any).target as HTMLElement | null;
                if (el) el.style.boxShadow = "none";
            }}
            disabled={disabled || isLoading}
            aria-busy={isLoading}
            className={[
                "relative inline-flex items-center justify-center transition-all duration-200 select-none",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variantStyles[variant],
                sizeStyles[size],
                className,
            ].join(" ")}
            style={
                isPrimary
                    ? {
                        background: "linear-gradient(135deg, #00FFFF 0%, #008B8B 100%)",
                    }
                    : undefined
            }
            {...(rest as any)}
        >
            {isLoading ? (
                <div className="flex items-center gap-2" aria-live="polite">
                    <Spinner />
                    <span>Loading…</span>
                </div>
            ) : (
                <>
                    {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
                </>
            )}
        </motion.button>
    );
}
