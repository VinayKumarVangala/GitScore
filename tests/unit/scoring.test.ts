import { describe, it, expect } from 'vitest';
import { calculateScorecard } from '@/lib/scoring/calculator';
import { GitHubUser, GitHubRepo, ContributionSummary } from '@/lib/github/types';

describe('Scoring Calculator', () => {
    it('should calculate a consistent scorecard for a standard user', () => {
        const user = {
            login: 'testuser',
            name: 'Test User',
            avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
            bio: 'A veteran developer scrying the coordinates of code.',
            public_repos: 10,
            followers: 50,
            following: 20,
            location: 'Sanctuary',
            company: 'Coordinate Collective',
            blog: 'https://scryer.io',
            twitter_username: 'testscryer',
            email: 'test@scryer.io'
        } as GitHubUser;

        const repos = [
            {
                name: 'repo1',
                full_name: 'testuser/repo1',
                stargazers_count: 10,
                forks_count: 5,
                open_issues_count: 2,
                language: 'TypeScript',
                fork: false,
                updated_at: new Date().toISOString(),
                pushed_at: new Date().toISOString(),
                topics: ['nextjs', 'react'],
                license: { name: 'MIT' }
            }
        ] as any as GitHubRepo[];

        const contrib = {
            totalCommits: 100,
            totalPRs: 10,
            totalIssues: 5,
            totalComments: 20,
            activeDays: 20,
            longestStreak: 5,
            recentStreak: 2,
            eventsByType: {
                PushEvent: 100,
                PullRequestEvent: 10,
                IssuesEvent: 5
            },
            dailyActivity: {
                '2026-02-20': 5,
                '2026-02-21': 10
            }
        } as ContributionSummary;

        const scorecard = calculateScorecard({
            user,
            repos,
            events: [],
            contrib,
            pinned: []
        });

        expect(scorecard.username).toBe('testuser');
        expect(scorecard.totalScore).toBeGreaterThan(0);
        expect(scorecard.totalScore).toBeLessThanOrEqual(100);
        expect(scorecard.dimensions.activity.score).toBeDefined();
        expect(scorecard.highlights.length).toBeGreaterThan(0);
    });
});
