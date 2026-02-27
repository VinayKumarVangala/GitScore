"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCopy, FiCheck, FiChevronRight, FiDownload, FiExternalLink } from "react-icons/fi";
import MysticalCard from "@/components/ui/MysticalCard";
import MysticalButton from "@/components/ui/MysticalButton";
import { BadgeStyle } from "@/lib/badge/badge-generator";

interface BadgeGeneratorProps {
    username: string;
    className?: string;
}

export default function BadgeGenerator({ username, className = "" }: BadgeGeneratorProps) {
    const [style, setStyle] = useState<BadgeStyle>("mystical");
    const [copied, setCopied] = useState(false);
    const [format, setFormat] = useState<"markdown" | "html">("markdown");

    const badgeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/badge/${username}?style=${style}`;
    const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/score/${username}`;

    const code = format === "markdown"
        ? `[![GitScore](${badgeUrl})](${profileUrl})`
        : `<a href="${profileUrl}"><img src="${badgeUrl}" alt="GitScore" /></a>`;

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const styles: { id: BadgeStyle; label: string }[] = [
        { id: "mystical", label: "Mystical Glow" },
        { id: "flat", label: "Minimal Flat" },
        { id: "plastic", label: "Glass Effect" },
    ];

    return (
        <MysticalCard className={`p-6 sm:p-8 ${className}`}>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">README Badge</h3>
                        <p className="text-sm text-foreground/50">Showcase your developer rank on your GitHub profile.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Style</label>
                            <div className="flex flex-wrap gap-2">
                                {styles.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setStyle(s.id)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${style === s.id
                                                ? "bg-cyan-primary/10 border-cyan-primary text-cyan-primary"
                                                : "bg-white/5 border-white/5 text-foreground/40 hover:text-white"
                                            }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Format</label>
                            <div className="flex gap-2">
                                {["markdown", "html"].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFormat(f as any)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${format === f
                                                ? "bg-cyan-primary/10 border-cyan-primary text-cyan-primary"
                                                : "bg-white/5 border-white/5 text-foreground/40 hover:text-white"
                                            }`}
                                    >
                                        {f.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview & Code */}
                <div className="flex-1 space-y-4">
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-6 relative group">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 absolute top-4 left-4">Live Preview</div>
                        <img
                            key={style}
                            src={`/api/badge/${username}?style=${style}`}
                            alt="Badge Preview"
                            className="h-10 animate-float"
                        />
                    </div>

                    <div className="relative">
                        <pre className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-foreground/60 font-mono overflow-x-auto whitespace-pre-wrap break-all pr-12 h-24 flex items-center">
                            {code}
                        </pre>
                        <button
                            onClick={copyCode}
                            className="absolute top-2 right-2 p-2 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-primary/50 text-foreground/40 hover:text-cyan-primary transition-all"
                            title="Copy to clipboard"
                        >
                            {copied ? <FiCheck /> : <FiCopy />}
                        </button>
                    </div>

                    <p className="text-[10px] font-bold text-foreground/30 italic text-center">
                        * Score updates automatically when you re-analyze your profile.
                    </p>
                </div>
            </div>
        </MysticalCard>
    );
}
