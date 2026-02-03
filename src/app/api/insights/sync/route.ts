import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchLeetCodeRating, fetchCodeforcesRating, fetchAtCoderRating, RatingHistoryEntry } from "@/lib/ratings";

/**
 * POST /api/insights/sync
 * 
 * Triggers a manual synchronization of contest ratings for the logged-in user.
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user profiles
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                leetcodeUsername: true,
                codeforcesUsername: true,
                atcoderUsername: true,
            }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const results: Record<string, any> = {};

        // 1. LeetCode
        if (user.leetcodeUsername) {
            try {
                const history = await fetchLeetCodeRating(user.leetcodeUsername);
                await saveContestResults(session.user.id, history);
                results.leetcode = { success: true, count: history.length };
            } catch (e) {
                console.error("LeetCode sync failed", e);
                results.leetcode = { success: false, error: String(e) };
            }
        }

        // 2. Codeforces
        if (user.codeforcesUsername) {
            try {
                const history = await fetchCodeforcesRating(user.codeforcesUsername);
                await saveContestResults(session.user.id, history);
                results.codeforces = { success: true, count: history.length };
            } catch (e) {
                console.error("Codeforces sync failed", e);
                results.codeforces = { success: false, error: String(e) };
            }
        }

        // 3. AtCoder
        if (user.atcoderUsername) {
            try {
                const history = await fetchAtCoderRating(user.atcoderUsername);
                await saveContestResults(session.user.id, history);
                results.atcoder = { success: true, count: history.length };
            } catch (e) {
                console.error("AtCoder sync failed", e);
                results.atcoder = { success: false, error: String(e) };
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

async function saveContestResults(userId: string, history: RatingHistoryEntry[]) {
    // Process in chunks or individually
    // Using transaction for atomicity per platform might be good, but upsert is fine

    for (const entry of history) {
        // Calculate delta if missing (LeetCode doesn't give it directly mostly)
        // We can just store what we have.

        await prisma.contestResult.upsert({
            where: {
                userId_platform_contestId: {
                    userId,
                    platform: entry.platform,
                    contestId: entry.contestId
                }
            },
            update: {
                contestName: entry.contestName,
                rank: entry.rank,
                newRating: entry.rating,
                delta: entry.delta,
                attendedAt: entry.attendedAt,
            },
            create: {
                userId,
                platform: entry.platform,
                contestId: entry.contestId,
                contestName: entry.contestName,
                rank: entry.rank,
                newRating: entry.rating,
                delta: entry.delta,
                attendedAt: entry.attendedAt,
            }
        });
    }
}
