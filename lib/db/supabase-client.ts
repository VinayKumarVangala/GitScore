import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing. Watchlist features will be disabled.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WatchlistEntry {
    id: string;
    username: string;
    last_score: number;
    last_grade: string;
    last_checked: string;
    created_at: string;
}

export async function addToWatchlist(username: string, score: number, grade: string) {
    const { data, error } = await supabase
        .from("watchlist")
        .upsert(
            {
                username,
                last_score: score,
                last_grade: grade,
                last_checked: new Date().toISOString()
            },
            { onConflict: "username" }
        )
        .select();

    if (error) throw error;
    return data[0];
}

export async function removeFromWatchlist(username: string) {
    const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("username", username);

    if (error) throw error;
}

export async function getWatchlist() {
    const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .order("last_checked", { ascending: false });

    if (error) throw error;
    return data as WatchlistEntry[];
}

export async function checkWatchlistStatus(username: string) {
    const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("username", username)
        .maybeSingle();

    if (error) throw error;
    return data as WatchlistEntry | null;
}
