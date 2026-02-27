"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { RiGithubLine } from "react-icons/ri";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { pathname } = useRouter();

    return (
        <header className="relative z-50">
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-primary/60 to-transparent" />

            <div
                className="backdrop-blur-md border-b border-cyan-primary/10"
                style={{ background: "rgba(10, 15, 30, 0.85)" }}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <motion.div
                                whileHover={{ rotate: 20, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className="text-2xl text-cyan-primary"
                            >
                                <RiGithubLine />
                            </motion.div>
                            <span className="text-xl font-bold tracking-tight">
                                <span
                                    className="bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(135deg, #00FFFF 0%, #008B8B 100%)",
                                    }}
                                >
                                    Git
                                </span>
                                <span className="text-foreground">Score</span>
                            </span>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {NAV_LINKS.map(({ href, label }) => {
                                const active = pathname === href;
                                return (
                                    <Link key={href} href={href} className="relative px-4 py-2 group">
                                        <span
                                            className={`text-sm font-medium transition-colors duration-200 ${active ? "text-cyan-primary" : "text-foreground/70 group-hover:text-cyan-primary"
                                                }`}
                                        >
                                            {label}
                                        </span>
                                        {/* Underline glow */}
                                        <motion.span
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-cyan-primary rounded-full"
                                            initial={false}
                                            animate={{ width: active ? "60%" : "0%" }}
                                            whileHover={{ width: "60%" }}
                                            style={{ boxShadow: "0 0 8px rgba(0,255,255,0.8)" }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    </Link>
                                );
                            })}

                            {/* CTA button */}
                            <motion.a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                className="ml-4 px-4 py-1.5 rounded-lg text-sm font-semibold text-background border border-cyan-primary/60 cursor-pointer"
                                style={{
                                    background: "linear-gradient(135deg, #00FFFF 0%, #008B8B 100%)",
                                    boxShadow: "0 0 16px rgba(0,255,255,0.25)",
                                }}
                            >
                                Connect GitHub
                            </motion.a>
                        </nav>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen((v) => !v)}
                            className="md:hidden p-2 text-cyan-primary hover:text-cyan-primary/80 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <motion.div
                                animate={{ rotate: mobileOpen ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                            </motion.div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="mobile-menu"
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="md:hidden absolute left-0 right-0 z-40"
                        style={{
                            background: "rgba(10, 15, 30, 0.97)",
                            borderBottom: "1px solid rgba(0,255,255,0.15)",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <nav className="max-w-6xl mx-auto px-4 pb-4 pt-2 flex flex-col gap-1">
                            {NAV_LINKS.map(({ href, label }, i) => {
                                const active = pathname === href;
                                return (
                                    <motion.div
                                        key={href}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                    >
                                        <Link
                                            href={href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                                                ? "text-cyan-primary bg-cyan-primary/10"
                                                : "text-foreground/70 hover:text-cyan-primary hover:bg-cyan-primary/5"
                                                }`}
                                        >
                                            {label}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                            <motion.a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: NAV_LINKS.length * 0.06 }}
                                onClick={() => setMobileOpen(false)}
                                className="mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-center text-background"
                                style={{
                                    background: "linear-gradient(135deg, #00FFFF 0%, #008B8B 100%)",
                                    boxShadow: "0 0 16px rgba(0,255,255,0.2)",
                                }}
                            >
                                Connect GitHub
                            </motion.a>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
