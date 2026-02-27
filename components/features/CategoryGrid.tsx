"use client";

import { motion } from "framer-motion";
import { FiChevronRight, FiZap, FiCode, FiUsers, FiUser } from "react-icons/fi";
import MysticalCard from "@/components/ui/MysticalCard";
import { LinearProgress } from "@/components/ui/MysticalProgress";
import { DetailedScorecard, ScoreDimension } from "@/lib/github/types";

interface CategoryGridProps {
    scorecard: DetailedScorecard;
    onSelectCategory?: (category: string) => void;
    className?: string;
}

interface CategoryCardProps {
    dimension: ScoreDimension;
    icon: React.ReactNode;
    id: string;
    onSelect?: (id: string) => void;
    index: number;
}

function CategoryCard({ dimension, icon, id, onSelect, index }: CategoryCardProps) {
    const { label, score, details } = dimension;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
        >
            <MysticalCard
                variant="interactive"
                glowIntensity="low"
                onClick={() => onSelect?.(id)}
                className="h-full cursor-pointer group"
            >
                <div className="p-5 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-cyan-primary/10 text-cyan-primary group-hover:bg-cyan-primary/20 transition-colors">
                            {icon}
                        </div>
                        <div className="flex items-center gap-1 text-foreground/40 group-hover:text-cyan-primary transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Details</span>
                            <FiChevronRight size={14} />
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">{label}</h3>
                    <p className="text-xs text-foreground/50 mb-4 line-clamp-2">{details}</p>

                    <div className="mt-auto">
                        <LinearProgress
                            value={score}
                            height={6}
                            showValue
                        />
                    </div>
                </div>
            </MysticalCard>
        </motion.div>
    );
}

export default function CategoryGrid({ scorecard, onSelectCategory, className = "" }: CategoryGridProps) {
    const { dimensions } = scorecard;

    const categories = [
        { id: "activity", dimension: dimensions.activity, icon: <FiZap size={20} /> },
        { id: "repositories", dimension: dimensions.repositories, icon: <FiCode size={20} /> },
        { id: "community", dimension: dimensions.community, icon: <FiUsers size={20} /> },
        { id: "profile", dimension: dimensions.consistency, icon: <FiUser size={20} /> },
    ];

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
            {categories.map((cat, idx) => (
                <CategoryCard
                    key={cat.id}
                    id={cat.id}
                    dimension={cat.dimension}
                    icon={cat.icon}
                    onSelect={onSelectCategory}
                    index={idx}
                />
            ))}
        </div>
    );
}
