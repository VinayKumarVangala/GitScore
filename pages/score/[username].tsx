"use client";

import { GetServerSideProps } from "next";
import { useState } from "react";
import { motion } from "framer-motion";
import {
    fetchUserProfile,
    fetchUserRepos,
    fetchUserEvents,
    fetchContributions,
    fetchPinnedRepos
} from "@/lib/github/queries";
import { calculateScorecard } from "@/lib/scoring/calculator";
import {
    DetailedScorecard,
    GitHubUser,
    GitHubRepo
} from "@/lib/github/types";
import dynamic from "next/dynamic";

const ScoreDashboard = dynamic(() => import("@/components/features/ScoreDashboard"), {
    loading: () => <div className="h-96 w-full animate-pulse bg-white/5 rounded-3xl" />,
    ssr: true
});
const ActionButtons = dynamic(() => import("@/components/features/ActionButtons"), {
    ssr: false // Client side only for event handlers/exports
});
const RepositoryList = dynamic(() => import("@/components/features/RepositoryList"), {
    loading: () => <div className="h-64 w-full animate-pulse bg-white/5 rounded-xl" />
});
const RepoQuickView = dynamic(() => import("@/components/features/RepoQuickView"), { ssr: false });
const ProfileHeader = dynamic(() => import("@/components/features/ProfileHeader"));
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import SEO from "@/components/layout/SEO";

interface ScoreResultPageProps {
    scorecard: DetailedScorecard;
    user: GitHubUser;
    repos: GitHubRepo[];
    error?: string;
}

export default function ScoreResultPage({ scorecard, user, repos, error }: ScoreResultPageProps) {
    const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="p-8 rounded-3xl bg-red-400/5 border border-red-400/10 text-center">
                    <h2 className="text-xl font-bold text-red-100 mb-2">Analysis Failed</h2>
                    <p className="text-red-400/60 text-sm max-w-sm">{error}</p>
                </div>
                <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-primary hover:text-white transition-colors">
                    <FiArrowLeft /> Back to Search
                </Link>
            </div>
        );
    }

    // SEO Info
    const ogImage = `https://git-score-v1.vercel.app/api/og?username=${user.login}&score=${scorecard.totalScore}&grade=${scorecard.grade}`;

    return (
        <>
            <SEO
                title={`${user.name || user.login}'s GitHub Score`}
                description={`${user.login} scored ${scorecard.totalScore} (${scorecard.grade}) on GitScore. View their full developer profile analysis and metrics.`}
                ogImage={ogImage}
                ogType="profile"
                username={user.login}
            />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
                {/* Breadcrumb / Back */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-cyan-primary transition-colors">
                        <FiArrowLeft /> Return to Sanctuary
                    </Link>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-primary/40">
                        Report Hash: {scorecard.fetchedAt.split('T')[0].replace(/-/g, '')}{String(user.login).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString().padStart(4, '0')}
                    </div>
                </div>

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <ProfileHeader user={user} />
                </motion.div>

                {/* Global Action Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <ActionButtons scorecard={scorecard} />
                </motion.div>

                {/* Main Dashboard Assembly */}
                <ScoreDashboard scorecard={scorecard} repos={repos} />

                {/* Full Repository List Section (Integrated below as fallback/depth) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6 pt-12 border-t border-white/5"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-white">Repository sanctum</h2>
                            <p className="text-xs text-foreground/40 font-bold uppercase mt-1">Deep analysis of your indexed codebases</p>
                        </div>
                    </div>
                    <RepositoryList repos={repos} onRepoClick={setSelectedRepo} />
                </motion.div>

                {/* Quick View Modal */}
                <RepoQuickView
                    repo={selectedRepo}
                    isOpen={!!selectedRepo}
                    onClose={() => setSelectedRepo(null)}
                />

                {/* Footer Credit Overlay */}
                <div className="text-center pt-24 pb-12 opacity-20 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Generated by GitScore Mystical Engine</p>
                </div>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { params, res } = context;
    const username = params?.username as string;

    if (!username) {
        return { notFound: true };
    }

    // Edge caching for 10 minutes, stale for a day
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=600, stale-while-revalidate=86400'
    );

    try {
        // 1. Fetch all raw data in parallel for speed
        const [user, repos, events, contrib, pinned] = await Promise.all([
            fetchUserProfile(username),
            fetchUserRepos(username),
            fetchUserEvents(username),
            fetchContributions(username),
            fetchPinnedRepos(username)
        ]);

        if (!user) {
            return { notFound: true };
        }

        // 2. Run the scoring engine
        const scorecard = calculateScorecard({
            user,
            repos,
            events,
            contrib,
            pinned
        });

        return {
            props: {
                scorecard: JSON.parse(JSON.stringify(scorecard)), // Ensure serializable
                user: JSON.parse(JSON.stringify(user)),
                repos: JSON.parse(JSON.stringify(repos)),
            }
        };
    } catch (error: any) {
        console.error("SSR Score Calculation Error:", error);
        return {
            props: {
                error: error.message || "Failed to analyze profile"
            }
        };
    }
};
