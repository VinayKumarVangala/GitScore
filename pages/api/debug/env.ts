import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const envVars = {
        hasGithubToken: !!process.env.GITHUB_TOKEN,
        githubTokenLength: process.env.GITHUB_TOKEN?.length || 0,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || "local",
    };

    res.status(200).json(envVars);
}
