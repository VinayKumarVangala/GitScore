"use client";

import {
    InputHTMLAttributes,
    useState,
    forwardRef,
    ReactNode,
    useId,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

type ValidationState = "idle" | "success" | "error";

interface MysticalInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    helperText?: string;
    validationState?: ValidationState;
    onClear?: () => void;
    leftIcon?: ReactNode;
    showSearchIcon?: boolean;
}

const borderColors: Record<ValidationState, string> = {
    idle: "rgba(0,255,255,0.2)",
    success: "rgba(0,255,180,0.5)",
    error: "rgba(255,80,80,0.5)",
};

const focusGlows: Record<ValidationState, string> = {
    idle: "0 0 0 3px rgba(0,255,255,0.12), 0 0 20px rgba(0,255,255,0.1)",
    success: "0 0 0 3px rgba(0,255,180,0.15)",
    error: "0 0 0 3px rgba(255,80,80,0.15)",
};

const MysticalInput = forwardRef<HTMLInputElement, MysticalInputProps>(
    (
        {
            label,
            helperText,
            validationState = "idle",
            onClear,
            leftIcon,
            showSearchIcon = false,
            className = "",
            value,
            ...rest
        },
        ref
    ) => {
        const [focused, setFocused] = useState(false);
        const reactId = useId();

        const hasValue = value !== undefined ? String(value).length > 0 : false;

        const ValidationIcon =
            validationState === "success"
                ? FiCheckCircle
                : validationState === "error"
                    ? FiAlertCircle
                    : null;

        const inputId = rest.id || `input-${rest.name || reactId}`;
        const helperId = `${inputId}-helper`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-medium text-foreground/60 mb-1.5 tracking-wide"
                    >
                        {label}
                    </label>
                )}

                <div className="relative flex items-center group">
                    {/* Left icon / search icon */}
                    {(showSearchIcon || leftIcon) && (
                        <div className="absolute left-3.5 text-foreground/40 group-focus-within:text-cyan-primary transition-colors duration-200 pointer-events-none z-10">
                            {leftIcon ?? <FiSearch size={17} />}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        value={value}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        aria-invalid={validationState === "error"}
                        aria-describedby={helperText ? helperId : undefined}
                        className={[
                            "w-full bg-card/60 backdrop-blur-sm rounded-xl text-sm text-foreground placeholder:text-foreground/30",
                            "border transition-all duration-200 outline-none",
                            "py-3",
                            showSearchIcon || leftIcon ? "pl-10" : "pl-4",
                            (onClear && hasValue) || ValidationIcon ? "pr-10" : "pr-4",
                            className,
                        ].join(" ")}
                        style={{
                            borderColor: borderColors[validationState],
                            boxShadow: focused ? focusGlows[validationState] : "none",
                        }}
                        {...rest}
                    />

                    {/* Right: clear or validation icon */}
                    <div className="absolute right-3.5 flex items-center gap-1.5 z-10">
                        <AnimatePresence>
                            {onClear && hasValue && (
                                <motion.button
                                    key="clear"
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.7 }}
                                    type="button"
                                    onClick={onClear}
                                    aria-label="Clear input"
                                    className="text-foreground/40 hover:text-foreground/80 transition-colors"
                                >
                                    <FiX size={16} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                        {ValidationIcon && (
                            <ValidationIcon
                                size={16}
                                aria-hidden="true"
                                className={
                                    validationState === "success"
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                }
                            />
                        )}
                    </div>
                </div>

                {/* Helper / error text */}
                <AnimatePresence>
                    {helperText && (
                        <motion.p
                            key="helper"
                            id={helperId}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            role={validationState === "error" ? "alert" : undefined}
                            className={[
                                "mt-1.5 text-xs",
                                validationState === "error"
                                    ? "text-red-400"
                                    : validationState === "success"
                                        ? "text-emerald-400"
                                        : "text-foreground/40",
                            ].join(" ")}
                        >
                            {helperText}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

MysticalInput.displayName = "MysticalInput";
export default MysticalInput;
