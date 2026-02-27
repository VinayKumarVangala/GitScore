"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLayout, FiGrid, FiBarChart2, FiBox, FiMessageSquare } from "react-icons/fi";
import OverallScoreCard from "./OverallScoreCard";
import CategoryGrid from "./CategoryGrid";
import CategoryDetail from "./CategoryDetail";
import { DetailedScorecard, GitHubRepo } from "@/lib/github/types";
import LanguageChart from "@/components/visuals/LanguageChart";
import ActivityTimeline from "@/components/visuals/ActivityTimeline";
import StarConstellation from "@/components/visuals/StarConstellation";
import MysticalAura from "@/components/visuals/MysticalAura";
import RecommendationsList from "./RecommendationsList";
import { generateRecommendations } from "@/lib/recommendations/generator";
import BadgeGenerator from "./BadgeGenerator";

interface ScoreDashboardProps {
    scorecard: DetailedScorecard;
    repos?: GitHubRepo[];
    className?: string;
}

type TabId = "overview" | "analysis" | "repositories" | "recommendations";

export default function ScoreDashboard({ scorecard, repos = [], className = "" }: ScoreDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const tabs = [
        { id: "overview", label: "Overview", icon: <FiLayout /> },
        { id: "analysis", label: "Analysis", icon: <FiBarChart2 /> },
        { id: "repositories", label: "Repositories", icon: <FiBox /> },
        { id: "recommendations", label: "Insights", icon: <FiMessageSquare /> },
    ];

    const handleCategorySelect = (id: string) => {
        setSelectedCategory(id);
        setActiveTab("analysis");
    };

    return (
        <div className={`space-y-8 ${className}`}>
            {/* Navigation Tabs */}
            <div
                className="flex items-center justify-center sm:justify-start gap-1 p-1 bg-white/5 border border-white/5 rounded-2xl w-full sm:w-max"
                role="tablist"
                aria-label="Dashboard views"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => {
                            setActiveTab(tab.id as TabId);
                            if (tab.id !== "analysis") setSelectedCategory(null);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? "bg-cyan-primary text-background shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                            : "text-foreground/40 hover:text-white"
                            }`}
                    >
                        <span aria-hidden="true">{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    id={`panel-${activeTab}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${activeTab}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div id="dashboard-summary" className="lg:col-span-1 flex flex-col gap-8">
                                <OverallScoreCard
                                    scorecard={scorecard}
                                />
                                <MysticalAura scorecard={scorecard} className="flex-1" />
                            </div>
                            <div className="lg:col-span-2 space-y-8">
                                <div id="dashboard-categories">
                                    <CategoryGrid
                                        scorecard={scorecard}
                                        onSelectCategory={handleCategorySelect}
                                    />
                                </div>
                                <div id="dashboard-visuals" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <LanguageChart languages={scorecard.topLanguages} className="h-80" />
                                    <ActivityTimeline contribution={scorecard.raw.activity.breakdown.commitFrequency.value > 0 ? {
                                        totalCommits: scorecard.raw.activity.breakdown.commitFrequency.value,
                                        activeDays: 0,
                                        longestStreak: scorecard.raw.activity.breakdown.streak.value,
                                        dailyActivity: {}
                                    } as any : { totalCommits: 0, activeDays: 0, longestStreak: 0, dailyActivity: {} } as any} />
                                </div>
                                <BadgeGenerator username={scorecard.username} />
                            </div>
                        </div>
                    )}

                    {activeTab === "analysis" && (
                        <div className="space-y-8">
                            {selectedCategory ? (
                                <div className="space-y-6">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        aria-label="Back to categories list"
                                        className="text-[10px] font-black uppercase tracking-widest text-cyan-primary hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <span aria-hidden="true">←</span> Back to All Categories
                                    </button>
                                    <CategoryDetail
                                        scorecard={scorecard}
                                        categoryId={selectedCategory}
                                        onBack={() => setSelectedCategory(null)}
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {Object.keys(scorecard.dimensions).map(id => (
                                        <CategoryDetail
                                            key={id}
                                            scorecard={scorecard}
                                            categoryId={id}
                                            onBack={() => setActiveTab("overview")}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "repositories" && (
                        <div className="space-y-8">
                            <StarConstellation repos={repos} className="h-[400px]" />
                            <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl" role="status">
                                <p className="text-foreground/40 text-sm">Full repository analysis coming in final dashboard assembly.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "recommendations" && (
                        <RecommendationsList output={generateRecommendations(scorecard)} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
