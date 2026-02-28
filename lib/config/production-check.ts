import { Octokit } from "octokit";

/**
 * Validates the current production environment on startup.
 * Checks for required variables, token validity, and API connectivity.
 */
export async function runProductionCheck() {
    const isProduction = process.env.NODE_ENV === "production";
    console.log(`[Production Check] Starting validation (Mode: ${process.env.NODE_ENV})...`);

    const essentialVars = ["GITHUB_TOKEN"];
    const optionalVars = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY"
    ];

    const missingEssential = essentialVars.filter(v => !process.env[v]);
    if (missingEssential.length > 0) {
        console.error(`[Production Check] CRITICAL: Missing essential environment variables: ${missingEssential.join(", ")}`);
        // We do NOT exit anymore to allow debug endpoints to work and help with diagnostics.
    }

    const missingOptional = optionalVars.filter(v => !process.env[v]);
    if (missingOptional.length > 0) {
        console.warn(`[Production Check] INFO: Optional environment variables missing: ${missingOptional.join(", ")}`);
    }

    // Verify GitHub Connectivity & Token
    if (process.env.GITHUB_TOKEN) {
        try {
            const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
            // Using getAuthenticated() will tell us if the token is valid
            const { data: user, headers } = await octokit.rest.users.getAuthenticated();

            const scopes = (headers["x-oauth-scopes"] as string) || "";
            const remaining = headers["x-ratelimit-remaining"];

            console.log(`[Production Check] GitHub API: Connected as ${user.login}`);
            console.log(`[Production Check] Token Scopes: ${scopes}`);
            console.log(`[Production Check] Rate Limit Remaining: ${remaining}`);

            const requiredScopes = ["repo", "read:user"];
            const missingScopes = requiredScopes.filter(s => !scopes.includes(s));

            if (missingScopes.length > 0) {
                console.warn(`[Production Check] WARNING: Token missing recommended scopes: ${missingScopes.join(", ")}`);
            }
        } catch (error) {
            console.error("[Production Check] CRITICAL: GitHub API connectivity failed. Check GITHUB_TOKEN.");
            console.error(error);
        }
    }

    // Verify Supabase Connectivity (Basic check)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
                headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! }
            });
            if (!res.ok) throw new Error(`Supabase returned status ${res.status}`);
            console.log("[Production Check] Supabase API: Accessible");
        } catch (error) {
            console.warn("[Production Check] WARNING: Supabase connectivity check failed.");
        }
    }

    console.log("[Production Check] Validation complete.");
}
