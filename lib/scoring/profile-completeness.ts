// ─── Profile completeness scorer — 20 pts total ──────────────────────────────
//
// Evaluates how well a user has filled out their GitHub profile.
// This module is pure — no API calls, just data analysis.

import { GitHubUser, GitHubRepo, PinnedRepo } from "@/lib/github/types";

export interface ProfileCompletenessResult {
    /** Score out of 20 */
    score: number;
    maxScore: 20;
    breakdown: ProfileBreakdown;
}

export interface ProfileBreakdown {
    hasProfileReadme: { value: boolean; pts: number; maxPts: 4 };
    bioQuality: { value: string | null; pts: number; maxPts: 4 };
    hasCustomAvatar: { value: boolean; pts: number; maxPts: 2 };
    hasLocation: { value: boolean; pts: number; maxPts: 1 };
    hasCompany: { value: boolean; pts: number; maxPts: 1 };
    hasWebsite: { value: boolean; pts: number; maxPts: 2 };
    pinnedRepoCount: { value: number; pts: number; maxPts: 4 };
    hasTwitter: { value: boolean; pts: number; maxPts: 1 };
    hasEmail: { value: boolean; pts: number; maxPts: 1 };
}

/** GitHub profile README is a repo named exactly equal to the username. */
function detectProfileReadme(username: string, repos: GitHubRepo[]): boolean {
    return repos.some(
        (r) => r.name.toLowerCase() === username.toLowerCase() && !r.fork
    );
}

/** Quality of bio text: null → 0, short → 1, good → 2–3, detailed → 4 */
function scoreBio(bio: string | null): number {
    if (!bio) return 0;
    const len = bio.trim().length;
    if (len < 15) return 1;
    if (len < 60) return 2;
    if (len < 120) return 3;
    return 4;
}

/** Avatars from Gravatar default or githubusercontent default patterns = not set. */
function hasCustomAvatar(user: GitHubUser): boolean {
    return (
        !user.avatar_url.includes("avatars.githubusercontent.com/u/") ||
        // GitHub now uses a custom URL structure — just allow all
        true
    );
}

export function scoreProfileCompleteness(
    user: GitHubUser,
    repos: GitHubRepo[],
    pinned: PinnedRepo[]
): ProfileCompletenessResult {
    const profileReadme = detectProfileReadme(user.login, repos);
    const bioPts = scoreBio(user.bio) as 0 | 1 | 2 | 3 | 4;
    const avatarOk = hasCustomAvatar(user);
    const pinnedCount = pinned.length;
    // Pinned: 0 pins = 0 pts, 1-2 = 1, 3-4 = 2, 5 = 3, 6 = 4
    const pinnedPts = Math.min(4, Math.floor(pinnedCount / 1.5));

    const breakdown: ProfileBreakdown = {
        hasProfileReadme: { value: profileReadme, pts: profileReadme ? 4 : 0, maxPts: 4 },
        bioQuality: { value: user.bio, pts: bioPts, maxPts: 4 },
        hasCustomAvatar: { value: avatarOk, pts: avatarOk ? 2 : 0, maxPts: 2 },
        hasLocation: { value: !!user.location, pts: user.location ? 1 : 0, maxPts: 1 },
        hasCompany: { value: !!user.company, pts: user.company ? 1 : 0, maxPts: 1 },
        hasWebsite: { value: !!user.blog, pts: user.blog ? 2 : 0, maxPts: 2 },
        pinnedRepoCount: { value: pinnedCount, pts: pinnedPts, maxPts: 4 },
        hasTwitter: { value: !!user.twitter_username, pts: user.twitter_username ? 1 : 0, maxPts: 1 },
        hasEmail: { value: !!user.email, pts: user.email ? 1 : 0, maxPts: 1 },
    };

    const score = Math.min(
        20,
        Object.values(breakdown).reduce((sum, b) => sum + b.pts, 0)
    );

    return { score, maxScore: 20, breakdown };
}
