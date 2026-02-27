import { NextApiRequest, NextApiResponse } from "next";
import { fetchRateLimit } from "@/lib/github/client";

/**
 * Health check endpoint providing system status and API metrics.
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // 1. Check GitHub API connectivity and rate limits
        const rateLimit = await fetchRateLimit();

        // 2. Simple Supabase Check (if configured)
        let supabaseHealth = "unknown";
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            try {
                const sRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
                    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! }
                });
                supabaseHealth = sRes.ok ? "healthy" : "degraded";
            } catch (e) {
                supabaseHealth = "unreachable";
            }
        }

        const health = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || "1.0.0",
            services: {
                github: {
                    status: "healthy",
                    rateLimit: {
                        limit: rateLimit.limit,
                        remaining: rateLimit.remaining,
                        used: rateLimit.used,
                        reset: rateLimit.reset.toISOString(),
                        usagePercentage: ((rateLimit.used / rateLimit.limit) * 100).toFixed(1) + "%"
                    }
                },
                supabase: {
                    status: supabaseHealth
                }
            },
            uptime: process.uptime()
        };

        // Determine overall status
        if (rateLimit.remaining === 0 || supabaseHealth === "unreachable") {
            health.status = "degraded";
        }

        return res.status(200).json(health);
    } catch (error: any) {
        return res.status(500).json({
            status: "error",
            timestamp: new Date().toISOString(),
            message: error.message || "Internal health check failure"
        });
    }
}
