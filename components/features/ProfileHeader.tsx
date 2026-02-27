"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUsers, FiMapPin, FiBriefcase, FiLink, FiChevronDown, FiChevronUp, FiGithub } from "react-icons/fi";
import Image from "next/image";
import { GitHubUser } from "@/lib/github/types";
import MysticalCard from "@/components/ui/MysticalCard";

interface ProfileHeaderProps {
    user: GitHubUser;
    className?: string;
}

export default function ProfileHeader({ user, className = "" }: ProfileHeaderProps) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const bioLimit = 120;
    const isLongBio = user.bio && user.bio.length > bioLimit;
    const displayBio = isBioExpanded ? user.bio : user.bio?.slice(0, bioLimit) + (isLongBio ? "..." : "");

    return (
        <MysticalCard className={`relative overflow-hidden ${className}`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

            <div className="relative p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar with Mystical Border */}
                <div className="relative group shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-primary via-purple-500 to-cyan-deep rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-card rounded-2xl overflow-hidden border border-white/10">
                        <Image
                            src={user.avatar_url}
                            alt={user.login}
                            fill
                            priority
                            sizes="(max-width: 768px) 128px, 160px"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-background border border-white/10 p-2 rounded-xl shadow-xl">
                        <FiGithub className="text-cyan-primary" size={20} />
                    </div>
                </div>

                {/* Identity & Bio */}
                <div className="flex-1 space-y-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{user.name || user.login}</h1>
                        <p className="text-lg font-bold text-cyan-primary/70 tracking-wide">GitHub Profile: @{user.login}</p>
                    </div>

                    <div className="space-y-3">
                        {user.bio && (
                            <div className="relative">
                                <p className="text-sm text-foreground/60 leading-relaxed">
                                    {displayBio}
                                </p>
                                {isLongBio && (
                                    <button
                                        onClick={() => setIsBioExpanded(!isBioExpanded)}
                                        aria-expanded={isBioExpanded}
                                        aria-label={isBioExpanded ? "Collapse biography" : "Read full biography"}
                                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-cyan-primary mt-2 hover:text-white transition-colors"
                                    >
                                        {isBioExpanded ? (
                                            <><FiChevronUp aria-hidden="true" /> Show Less</>
                                        ) : (
                                            <><FiChevronDown aria-hidden="true" /> Read Full Bio</>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-y-2 gap-x-4 pt-2">
                            {user.location && (
                                <div className="flex items-center gap-1.5 text-xs text-foreground/40 font-medium" aria-label={`Location: ${user.location}`}>
                                    <FiMapPin className="text-cyan-primary/60" aria-hidden="true" /> {user.location}
                                </div>
                            )}
                            {user.company && (
                                <div className="flex items-center gap-1.5 text-xs text-foreground/40 font-medium" aria-label={`Company: ${user.company}`}>
                                    <FiBriefcase className="text-cyan-primary/60" aria-hidden="true" /> {user.company}
                                </div>
                            )}
                            {user.blog && (
                                <a
                                    href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Website: ${user.blog}`}
                                    className="flex items-center gap-1.5 text-xs text-foreground/40 font-medium hover:text-cyan-primary transition-colors"
                                >
                                    <FiLink className="text-cyan-primary/60" aria-hidden="true" /> {user.blog.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Column */}
                <div className="w-full md:w-auto shrink-0 flex md:flex-col gap-3">
                    <StatBox label="Followers" value={user.followers} />
                    <StatBox label="Following" value={user.following} />
                    <StatBox label="Repositories" value={user.public_repos} />
                </div>
            </div>
        </MysticalCard>
    );
}

function StatBox({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex-1 md:w-36 p-4 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/8 transition-colors">
            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-1 group-hover:text-foreground/50">{label}</div>
            <div className="text-xl font-black text-white">{value.toLocaleString()}</div>
        </div>
    );
}
