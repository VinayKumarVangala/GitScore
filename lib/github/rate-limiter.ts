import { fetchRateLimit, getOctokit } from "./client";
import { triggerAlert } from "@/lib/monitoring/alert-system";

/**
 * Handles rate limiting logic for GitHub API calls.
 * Provides a central point for usage monitoring and alerting.
 */
export class RateLimiter {
    private static ALERT_THRESHOLD = 0.8; // 80% usage
    private static CRITICAL_THRESHOLD = 0.95; // 95% usage
    private static lastAlertTriggeredAt = 0;
    private static ALERT_COOLDOWN = 3600_000; // 1 hour

    /**
     * Checks the current rate limit and triggers alerts if necessary.
     */
    static async checkAndAlert() {
        try {
            const stats = await fetchRateLimit();
            const usageRatio = stats.used / stats.limit;

            if (usageRatio >= this.ALERT_THRESHOLD) {
                await this.maybeTriggerAlert(usageRatio, stats.remaining, stats.reset);
            }

            return stats;
        } catch (error) {
            console.error("[RateLimiter] Failed to check rate limits", error);
            return null;
        }
    }

    private static async maybeTriggerAlert(ratio: number, remaining: number, reset: Date) {
        const now = Date.now();
        if (now - this.lastAlertTriggeredAt < this.ALERT_COOLDOWN) return;

        const severity = ratio >= this.CRITICAL_THRESHOLD ? "CRITICAL" : "WARNING";
        const percentage = (ratio * 100).toFixed(1);

        console.warn(`[RateLimiter] ${severity}: GitHub API usage is at ${percentage}% (${remaining} remaining)`);

        await triggerAlert({
            title: `GitHub API Rate Limit ${severity}`,
            message: `Current usage is at ${percentage}%. ${remaining} requests remaining until reset at ${reset.toLocaleTimeString()}.`,
            severity,
            source: "github-api"
        });

        this.lastAlertTriggeredAt = now;
    }

    /**
     * Executes an Octokit request with rate-limit awareness and backoff.
     * Note: Most backoff is handled by Octokit's throttle plugin, 
     * but this provides a hook for custom logic.
     */
    static async execute<T>(fn: () => Promise<T>): Promise<T> {
        // Just before execution, we could check if we are already at 0 and wait/fail early
        const stats = await this.checkAndAlert();
        if (stats && stats.remaining === 0) {
            const waitTime = stats.reset.getTime() - Date.now();
            if (waitTime > 0 && waitTime < 10000) { // If it's just a few seconds, wait
                console.log(`[RateLimiter] Rate limit exhausted. Waiting ${waitTime}ms...`);
                await new Promise(r => setTimeout(r, waitTime + 500));
            } else if (waitTime > 0) {
                throw new Error(`Rate limit exhausted. Reset at ${stats.reset.toISOString()}`);
            }
        }

        return await fn();
    }
}
