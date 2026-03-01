"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import MysticalBackground from "./MysticalBackground";
import Header from "./Header";
import Footer from "./Footer";

interface MainLayoutProps {
    children: ReactNode;
}

import { Variants } from "framer-motion";

const pageVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: "easeIn" as const } },
};


export default function MainLayout({ children }: MainLayoutProps) {
    const { asPath } = useRouter();

    return (
        <div className="relative min-h-screen flex flex-col text-foreground">
            {/* Persistent mystical background */}
            <MysticalBackground />

            {/* Header */}
            <Header />

            {/* Page content with route-change transitions */}
            <main className="relative z-10 flex-1 w-full">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={asPath}
                        variants={pageVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="min-h-full"
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                            {children}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
