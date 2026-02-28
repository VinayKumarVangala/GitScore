import type { NextApiRequest, NextApiResponse } from "next";
import { getOctokit } from "@/lib/github/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const octokit = getOctokit();
        const { data } = await octokit.rest.rateLimit.get();

        res.status(200).json({
            status: "ok",
            message: "GitHub API connectivity verified",
            rateLimit: data.rate,
        });
    } catch (err: any) {
        res.status(500).json({
            status: "error",
            message: err.message,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
    }
}
