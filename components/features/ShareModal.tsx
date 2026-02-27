"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiX,
    FiCopy,
    FiCheck,
    FiTwitter,
    FiLinkedin,
    FiDownload,
    FiShare2,
    FiLink,
    FiCode
} from "react-icons/fi";
import QRCode from "qrcode";
import MysticalCard from "@/components/ui/MysticalCard";
import MysticalButton from "@/components/ui/MysticalButton";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    score: number;
}

export default function ShareModal({ isOpen, onClose, username, score }: ShareModalProps) {
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedEmbed, setCopiedEmbed] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string>("");

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `My GitHub Score is ${score}! Explore your developer aura on GitScore. #GitScore #GitHub`;
    const embedCode = `<a href="${shareUrl}"><img src="${typeof window !== "undefined" ? window.location.origin : ""}/api/badge/${username}" alt="GitScore" /></a>`;

    useEffect(() => {
        if (isOpen && shareUrl) {
            QRCode.toDataURL(shareUrl, {
                width: 200,
                margin: 2,
                color: {
                    dark: "#00ffff",
                    light: "#00000000",
                },
            }).then(setQrDataUrl);
        }
    }, [isOpen, shareUrl]);

    const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setFn(true);
        setTimeout(() => setFn(false), 2000);
    };

    const shareOnTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
    };

    const shareOnLinkedIn = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-2xl"
                    >
                        <MysticalCard className="relative overflow-hidden">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground/40 hover:text-white transition-all z-10"
                            >
                                <FiX size={20} />
                            </button>

                            <div className="p-8 sm:p-12 space-y-10">
                                <div className="text-center space-y-2">
                                    <div className="inline-flex p-3 rounded-2xl bg-cyan-primary/10 text-cyan-primary mb-2">
                                        <FiShare2 size={24} />
                                    </div>
                                    <h2 className="text-3xl font-black text-white">Share Your Rank</h2>
                                    <p className="text-sm text-foreground/40 font-medium italic">"The coordinates of power must be known."</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Left Side: Socials & Link */}
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Quick Socials</label>
                                            <div className="flex gap-3">
                                                <MysticalButton variant="secondary" onClick={shareOnTwitter} className="flex-1 gap-2 py-3">
                                                    <FiTwitter /> X
                                                </MysticalButton>
                                                <MysticalButton variant="secondary" onClick={shareOnLinkedIn} className="flex-1 gap-2 py-3">
                                                    <FiLinkedin /> LinkedIn
                                                </MysticalButton>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Share Link</label>
                                            <div className="relative">
                                                <input
                                                    readOnly
                                                    value={shareUrl}
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-foreground/60 pr-12 font-mono"
                                                />
                                                <button
                                                    onClick={() => copyToClipboard(shareUrl, setCopiedLink)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-cyan-primary hover:bg-cyan-primary/10 transition-all"
                                                >
                                                    {copiedLink ? <FiCheck /> : <FiCopy />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Embed Badge</label>
                                            <div className="relative">
                                                <pre className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-foreground/40 pr-12 font-mono line-clamp-2 overflow-hidden">
                                                    {embedCode}
                                                </pre>
                                                <button
                                                    onClick={() => copyToClipboard(embedCode, setCopiedEmbed)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-cyan-primary hover:bg-cyan-primary/10 transition-all"
                                                >
                                                    {copiedEmbed ? <FiCheck /> : <FiCopy />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: QR Code */}
                                    <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Mobile Scan</div>
                                        <div className="p-2 bg-white rounded-2xl relative group">
                                            {qrDataUrl ? (
                                                <img src={qrDataUrl} alt="QR Code" className="w-40 h-40 mix-blend-multiply" />
                                            ) : (
                                                <div className="w-40 h-40 bg-zinc-200 animate-pulse rounded-lg" />
                                            )}

                                            {/* Mystical Overlay */}
                                            <div className="absolute inset-0 border-2 border-cyan-primary/0 group-hover:border-cyan-primary/50 rounded-2xl transition-all pointer-events-none" />
                                        </div>
                                        <p className="text-[9px] font-bold text-foreground/20 text-center uppercase tracking-widest">
                                            Instant discovery from any rift
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={onClose}
                                        className="text-xs font-black uppercase tracking-widest text-foreground/20 hover:text-white transition-colors"
                                    >
                                        — Return —
                                    </button>
                                </div>
                            </div>
                        </MysticalCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
