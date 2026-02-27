"use client";

import { motion, AnimatePresence } from "framer-motion";

interface MysticalLoaderProps {
    progress?: number;
    message?: string;
    className?: string;
}

export default function MysticalLoader({ progress, message, className = "" }: MysticalLoaderProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
            {/* Mystical Crystal Spinner */}
            <div className="relative w-32 h-32 mb-8">
                {/* Glow behind */}
                <div className="absolute inset-0 bg-cyan-primary/20 rounded-full blur-2xl animate-pulse" />

                {/* Revolving Orbits */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-transparent border-t-cyan-primary/40 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-2 border-transparent border-b-purple-400/30 rounded-full"
                />

                {/* Central Crystal */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [45, 50, 45],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-12 h-12 bg-gradient-to-br from-cyan-primary to-cyan-deep rotate-45 shadow-[0_0_20px_rgba(0,255,255,0.6)] rounded-sm"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.4)_50%,transparent_55%)] bg-[length:200%_200%] animate-shimmer" />
                    </motion.div>
                </div>
            </div>

            {/* Progress & Message */}
            <div className="space-y-4 max-w-xs">
                {progress !== undefined && (
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-center">
                            <span className="text-2xl font-black text-white/90 tracking-tighter">
                                {progress}%
                            </span>
                        </div>
                        <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded-full bg-white/5 border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-cyan-primary to-cyan-deep shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                            />
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.p
                        key={message}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm font-medium text-foreground/60 italic leading-relaxed h-12"
                    >
                        {message}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
}
