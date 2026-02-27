import { NextApiRequest, NextApiResponse } from "next";
import {
    addToWatchlist,
    removeFromWatchlist,
    getWatchlist,
    checkWatchlistStatus
} from "@/lib/db/supabase-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { username, score, grade } = req.body;

    try {
        switch (method) {
            case "GET":
                const { username: checkUser } = req.query;
                if (checkUser) {
                    const status = await checkWatchlistStatus(checkUser as string);
                    return res.status(200).json(status);
                }
                const list = await getWatchlist();
                return res.status(200).json(list);

            case "POST":
                if (!username) return res.status(400).json({ error: "Username required" });
                const entry = await addToWatchlist(username, score, grade);
                return res.status(201).json(entry);

            case "DELETE":
                const { username: deleteUser } = req.query;
                if (!deleteUser) return res.status(400).json({ error: "Username required" });
                await removeFromWatchlist(deleteUser as string);
                return res.status(200).json({ success: true });

            default:
                res.setHeader("Allow", ["GET", "POST", "DELETE"]);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error: any) {
        console.error("Watchlist API Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
