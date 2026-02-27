import { describe, it, expect } from 'vitest';
import { aggregateLanguages, analyseReadme, repoActivityScore, scoreToGrade } from '@/lib/github/utils';
import { GitHubRepo, LanguageMap } from '@/lib/github/types';

describe('GitHub Utils', () => {
    describe('aggregateLanguages', () => {
        it('should correctly aggregate language bytes and percentages', () => {
            const maps: LanguageMap[] = [
                { TypeScript: 100, JavaScript: 100 },
                { TypeScript: 200, Python: 100 }
            ];
            const result = aggregateLanguages(maps);

            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({ name: 'TypeScript', bytes: 300, percentage: 60 });
            expect(result[1]).toEqual({ name: 'JavaScript', bytes: 100, percentage: 20 });
            expect(result[2]).toEqual({ name: 'Python', bytes: 100, percentage: 20 });
        });

        it('should handle empty maps', () => {
            expect(aggregateLanguages([])).toEqual([]);
        });
    });

    describe('analyseReadme', () => {
        it('should score a high-quality README correctly', () => {
            const content = `
# Project Title
![Badge](https://img.shields.io/badge/test-v1.0-blue)
## Introduction
This is a high quality readme with code blocks and links.
\`\`\`js
console.log("hello");
\`\`\`
[Link](https://example.com)
## Features
- Feature 1
## Installation
Steps here.
## Usage
How to use.
            `;
            const result = analyseReadme(content);
            expect(result.exists).toBe(true);
            expect(result.score).toBeGreaterThan(80);
            expect(result.hasTitle).toBe(true);
            expect(result.hasBadges).toBe(true);
            expect(result.hasCodeBlocks).toBe(true);
        });

        it('should return zero score for null content', () => {
            const result = analyseReadme(null);
            expect(result.exists).toBe(false);
            expect(result.score).toBe(0);
        });
    });

    describe('repoActivityScore', () => {
        it('should give high score to recently pushed, popular repos', () => {
            const repo = {
                pushed_at: new Date().toISOString(),
                stargazers_count: 100,
                forks_count: 50,
                description: 'A great repo',
                homepage: 'https://example.com',
                topics: ['test'],
                license: { name: 'MIT' }
            } as any as GitHubRepo;

            const score = repoActivityScore(repo);
            expect(score).toBeGreaterThan(70);
        });
    });

    it('should map scores to correct grades', () => {
        expect(scoreToGrade(96)).toBe('A+');
        expect(scoreToGrade(85)).toBe('A');
        expect(scoreToGrade(40)).toBe('C');
        expect(scoreToGrade(10)).toBe('F');
    });
});
