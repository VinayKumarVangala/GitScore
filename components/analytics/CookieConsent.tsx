"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield, FiX, FiCheck } from "react-icons/fi";
import MysticalButton from "@/components/ui/MysticalButton";

const CONSENT_KEY = "gitscore_cookie_consent";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleConsent = (accepted: boolean) => {
        localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "declined");
        setIsVisible(false);

        if (accepted && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 z-50 md:left-auto md:max-w-md"
                >
                    <div className="bg-background-deep/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        {/* Mystical Pattern Overlay */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_top_right,var(--cyan-primary),transparent)]" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-cyan-primary/10 rounded-lg">
                                    <FiShield className="text-cyan-primary text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Privacy Covenant</h3>
                            </div>

                            <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
                                We seek your permission to monitor the ethereal flows of your interaction. This data helps us refine the scrying rituals for all developers.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <MysticalButton
                                    variant="primary"
                                    onClick={() => handleConsent(true)}
                                    className="flex-1 gap-2"
                                >
                                    <FiCheck /> Accept Ritual
                                </MysticalButton>
                                <MysticalButton
                                    variant="ghost"
                                    onClick={() => handleConsent(false)}
                                    className="flex-1 gap-2 border border-white/5 opacity-60 hover:opacity-100"
                                >
                                    <FiX /> Decline
                                </MysticalButton>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
