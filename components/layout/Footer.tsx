"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RiGithubLine, RiTwitterXFill, RiLinkedinBoxFill } from "react-icons/ri";

const SOCIAL_LINKS = [
    { href: "https://github.com", icon: <RiGithubLine size={20} />, label: "GitHub" },
    { href: "https://twitter.com", icon: <RiTwitterXFill size={18} />, label: "Twitter/X" },
    { href: "https://linkedin.com", icon: <RiLinkedinBoxFill size={20} />, label: "LinkedIn" },
];

const FOOTER_LINKS = [
    { href: "/", label: "Home" },
    { href: "/examples", label: "Examples" },
    { href: "/about", label: "About" },
    { href: "/privacy", label: "Privacy" },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative z-10 mt-auto">
            {/* Animated separator */}
            <div className="relative h-[1px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-deep/40 to-transparent" />
                <motion.div
                    className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-cyan-primary to-transparent"
                    animate={{ x: ["calc(-100%)", "calc(100vw)"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <div
                className="backdrop-blur-md border-t border-cyan-primary/10"
                style={{ background: "rgba(10, 15, 30, 0.9)" }}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

                        {/* Brand */}
                        <div>
                            <Link href="/" className="inline-block mb-3">
                                <span className="text-2xl font-bold">
                                    <span
                                        className="bg-clip-text text-transparent"
                                        style={{
                                            backgroundImage: "linear-gradient(135deg, #00FFFF 0%, #008B8B 100%)",
                                        }}
                                    >
                                        Git
                                    </span>
                                    <span className="text-foreground">Score</span>
                                </span>
                            </Link>
                            <p className="text-foreground/50 text-sm leading-relaxed max-w-xs">
                                Uncover your GitHub mystical power. Analyze, visualize, and level up your developer profile.
                            </p>
                        </div>

                        {/* Quick links */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-cyan-deep mb-4">
                                Navigation
                            </h4>
                            <ul className="space-y-2">
                                {FOOTER_LINKS.map(({ href, label }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className="text-sm text-foreground/50 hover:text-cyan-primary transition-colors duration-200"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Social */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-cyan-deep mb-4">
                                Connect
                            </h4>
                            <div className="flex gap-3">
                                {SOCIAL_LINKS.map(({ href, icon, label }) => (
                                    <motion.a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        whileHover={{ scale: 1.15, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2.5 rounded-lg text-foreground/50 border border-foreground/10 hover:text-cyan-primary hover:border-cyan-primary/40 transition-colors duration-200"
                                        style={{
                                            background: "rgba(255,255,255,0.03)",
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(0,255,255,0.3)";
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                        }}
                                    >
                                        {icon}
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="pt-6 border-t border-foreground/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-foreground/30">
                            &copy; {year} GitScore. All rights reserved.
                        </p>
                        <p className="text-xs text-foreground/20">
                            Built with{" "}
                            <span className="text-cyan-deep">Next.js</span> &amp;{" "}
                            <span className="text-cyan-deep">Framer Motion</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
