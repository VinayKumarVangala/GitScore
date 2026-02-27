"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiCircle, FiLoader } from "react-icons/fi";
import MysticalLoader from "@/components/ui/MysticalLoader";
import MysticalCard from "@/components/ui/MysticalCard";
import { useLoadingSequence, LoadingStepId } from "@/hooks/useLoadingSequence";

interface LoadingSequenceProps {
    onComplete?: () => void;
    className?: string;
}

export default function LoadingSequence({ onComplete, className = "" }: LoadingSequenceProps) {
    const {
        currentStepIndex,
        progress,
        activeMessage,
        isComplete,
        startSequence,
        steps
    } = useLoadingSequence();

    useEffect(() => {
        const cleanup = startSequence();
        return cleanup;
    }, [startSequence]);

    useEffect(() => {
        if (isComplete && onComplete) {
            // Small delay before transition
            const timer = setTimeout(onComplete, 800);
            return () => clearTimeout(timer);
        }
    }, [isComplete, onComplete]);

    return (
        <div className={`w-full max-w-2xl mx-auto space-y-8 ${className}`}>
            {/* Main Loader Visual */}
            <MysticalLoader progress={progress} message={activeMessage} />

            {/* Checklist of steps */}
            <MysticalCard className="border-white/10 bg-card/40">
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {steps.map((step, idx) => {
                        const isDone = idx < currentStepIndex;
                        const isActive = idx === currentStepIndex;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-3 transition-opacity duration-500 ${!isDone && !isActive ? 'opacity-30' : 'opacity-100'}`}
                            >
                                <div className="flex-shrink-0">
                                    {isDone ? (
                                        <FiCheckCircle className="text-emerald-400" size={18} />
                                    ) : isActive ? (
                                        <FiLoader className="text-cyan-primary animate-spin" size={18} />
                                    ) : (
                                        <FiCircle className="text-foreground/20" size={18} />
                                    )}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-foreground/40'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </MysticalCard>

            {/* Decorative Aura */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-primary/5 rounded-full blur-[120px]"
                />
            </div>
        </div>
    );
}
