"use client";

import SEO from "@/components/layout/SEO";
import { motion } from "framer-motion";
import { FiGithub, FiZap, FiBarChart2, FiGlobe } from "react-icons/fi";
import Link from "next/link";
import MysticalButton from "@/components/ui/MysticalButton";

export default function AboutPage() {
    return (
        <>
            <SEO
                title="About | GitScore Mystical Engine"
                description="Learn about the GitScore project, the mystical scoring algorithm, and how we analyze GitHub engineering profiles."
            />

            <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
                {/* Header section */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex justify-center p-4 rounded-full bg-cyan-primary/10 border border-cyan-primary/20 text-cyan-primary mb-4 shadow-[0_0_30px_rgba(0,255,255,0.15)]"
                    >
                        <FiGlobe size={48} />
                    </motion.div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white">
                        About <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-primary to-blue-400">GitScore</span>
                    </h1>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
                        GitScore is a mystical analytical engine designed to scry the depths of a developer{"'"}s GitHub profile and visualize their engineering aura.
                    </p>
                </div>

                {/* Core Philosophy */}
                <div className="space-y-8 relative">
                    <div className="absolute inset-0 bg-cyan-primary/5 blur-[100px] pointer-events-none rounded-full" />

                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative z-10">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FiZap className="text-cyan-primary" /> The Philosophy
                        </h2>
                        <div className="mt-6 space-y-4 text-foreground/70 leading-relaxed font-medium">
                            <p>
                                Traditional metrics often fail to capture the entire spectrum of an engineer{"'"}s public work. Star counts are heavily skewed towards framework authors, while commit streaks only measure quantity, not impact.
                            </p>
                            <p>
                                GitScore attempts to holistically measure four dimensional planes:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-cyan-primary/80 ml-2">
                                <li><strong className="text-white font-bold">Activity Pulse:</strong> The rhythm of your commits, pulls, and issues.</li>
                                <li><strong className="text-white font-bold">Repository Sanctum:</strong> The impact and spread of the code you own.</li>
                                <li><strong className="text-white font-bold">Community Aura:</strong> Your reach through followers, forks, and external collaborations.</li>
                                <li><strong className="text-white font-bold">Endurance (Consistency):</strong> The timeline of your dedication to open source.</li>
                            </ul>
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative z-10">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FiBarChart2 className="text-purple-400" /> The Oracle Algorithm
                        </h2>
                        <div className="mt-6 space-y-4 text-foreground/70 leading-relaxed font-medium">
                            <p>
                                The scoring engine normalizes metrics across vast scales. Rather than linear addition, we use logarithmic curves to ensure a balanced assessment between a junior developer starting their journey and a celestial being with hundreds of thousands of stars.
                            </p>
                            <p>
                                The final grade (from E to SSS) is a weighted calculation reflecting your total dimensional alignment within the global open-source community.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to action */}
                <div className="text-center pt-8 border-t border-white/10">
                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs mb-6">
                        Ready to view your coordinates?
                    </p>
                    <Link href="/">
                        <MysticalButton variant="primary" className="px-8 text-lg">
                            <FiGithub className="inline mr-2" /> Start Scrying
                        </MysticalButton>
                    </Link>
                </div>
            </div>
        </>
    );
}
