import { Octokit } from "octokit";

/**
 * Validates the current production environment on startup.
 * Checks for required variables, token validity, and API connectivity.
 */
export async function runProductionCheck() {
    const isProduction = process.env.NODE_ENV === "production";
    console.log(`[Production Check] Starting validation (Mode: ${process.env.NODE_ENV})...`);

    const requiredVars = [
        "GITHUB_TOKEN",
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY"
    ];

    const missing = requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
        console.error(`[Production Check] CRITICAL: Missing environment variables: ${missing.join(", ")}`);
        if (isProduction) process.exit(1);
    }

    // Verify GitHub Connectivity & Token
    try {
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        const { data: user, headers } = await octokit.rest.users.getAuthenticated();

        const scopes = headers["x-oauth-scopes"] || "";
        const remaining = headers["x-ratelimit-remaining"];

        console.log(`[Production Check] GitHub API: Connected as ${user.login}`);
        console.log(`[Production Check] Token Scopes: ${scopes}`);
        console.log(`[Production Check] Rate Limit Remaining: ${remaining}`);

        // Minimum scopes check for deep scrying
        const requiredScopes = ["repo", "read:user"];
        const missingScopes = requiredScopes.filter(s => !scopes.includes(s));

        if (missingScopes.length > 0) {
            console.warn(`[Production Check] WARNING: Token missing recommended scopes: ${missingScopes.join(", ")}`);
        }
    } catch (error) {
        console.error("[Production Check] CRITICAL: GitHub API connectivity failed. Check GITHUB_TOKEN.");
        console.error(error);
        if (isProduction) process.exit(1);
    }

    // Verify Supabase Connectivity (Basic check)
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
            headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! }
        });
        if (!res.ok) throw new Error(`Supabase returned status ${res.status}`);
        console.log("[Production Check] Supabase API: Accessible");
    } catch (error) {
        console.warn("[Production Check] WARNING: Supabase connectivity check failed.");
        console.warn(error);
    }

    console.log("[Production Check] Validation complete.");
}
