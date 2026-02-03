import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/cron/contests
 *
 * Syncs upcoming contests from all platforms.
 * Should be called by a cron job (e.g., every 6 hours).
 *
 * Protected by CRON_SECRET.
 */
export async function POST(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get("authorization");
        const expectedSecret = process.env.CRON_SECRET;

        if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const results = {
            codeforces: { success: false, count: 0, error: null as string | null },
            leetcode: { success: false, count: 0, error: null as string | null },
            atcoder: { success: false, count: 0, error: null as string | null },
        };

        // Fetch Codeforces contests
        try {
            const cfContests = await fetchCodeforcesContests();
            for (const contest of cfContests) {
                await prisma.contest.upsert({
                    where: {
                        platform_contestId: {
                            platform: "codeforces",
                            contestId: contest.contestId,
                        },
                    },
                    update: {
                        name: contest.name,
                        startTime: contest.startTime,
                        endTime: contest.endTime,
                        duration: contest.duration,
                        url: contest.url,
                        phase: contest.phase,
                    },
                    create: {
                        platform: "codeforces",
                        contestId: contest.contestId,
                        name: contest.name,
                        startTime: contest.startTime,
                        endTime: contest.endTime,
                        duration: contest.duration,
                        url: contest.url,
                        phase: contest.phase,
                    },
                });
            }
            results.codeforces = { success: true, count: cfContests.length, error: null };
        } catch (error) {
            results.codeforces.error = error instanceof Error ? error.message : "Unknown error";
        }

        // Fetch LeetCode contests
        try {
            const lcContests = await fetchLeetCodeContests();
            for (const contest of lcContests) {
                await prisma.contest.upsert({
                    where: {
                        platform_contestId: {
                            platform: "leetcode",
                            contestId: contest.contestId,
                        },
                    },
                    update: {
                        name: contest.name,
                        startTime: contest.startTime,
                        endTime: contest.endTime,
                        duration: contest.duration,
                        url: contest.url,
                        phase: contest.phase,
                    },
                    create: {
                        platform: "leetcode",
                        contestId: contest.contestId,
                        name: contest.name,
                        startTime: contest.startTime,
                        endTime: contest.endTime,
                        duration: contest.duration,
                        url: contest.url,
                        phase: contest.phase,
                    },
                });
            }
            results.leetcode = { success: true, count: lcContests.length, error: null };
        } catch (error) {
            results.leetcode.error = error instanceof Error ? error.message : "Unknown error";
        }

        // Fetch AtCoder contests
        try {
            const acContests = await fetchAtCoderContests();
            for (const contest of acContests) {
                await prisma.contest.upsert({
                    where: {
                        platform_contestId: {
                            platform: "atcoder",
                            contestId: contest.contestId,
                        },
                    },
                    update: {
                        name: contest.name,
                        startTime: contest.startTime,
                        endTime: contest.endTime,
                        duration: contest.duration,
                        url: contest.url,
                        phase: contest.phase,
                    },
                    create: {
                        platform: "atcoder",
                        contestId: contest.contestId,
                        name: contest.name,
                        startTime: contest.startTime,
                        endTime: contest.endTime,
                        duration: contest.duration,
                        url: contest.url,
                        phase: contest.phase,
                    },
                });
            }
            results.atcoder = { success: true, count: acContests.length, error: null };
        } catch (error) {
            results.atcoder.error = error instanceof Error ? error.message : "Unknown error";
        }

        // Generate notifications for upcoming contests
        await generateContestNotifications();

        return NextResponse.json({
            success: true,
            results,
        });
    } catch (error) {
        console.error("Contest sync error:", error);
        return NextResponse.json(
            { error: "Failed to sync contests" },
            { status: 500 }
        );
    }
}

interface ContestData {
    contestId: string;
    name: string;
    startTime: Date;
    endTime: Date | null;
    duration: number | null;
    url: string;
    phase: string;
}

/**
 * Fetch contests from Codeforces API
 */
async function fetchCodeforcesContests(): Promise<ContestData[]> {
    const response = await fetch("https://codeforces.com/api/contest.list", {
        next: { revalidate: 0 },
    });

    if (!response.ok) {
        throw new Error(`Codeforces API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
        throw new Error("Codeforces API returned error status");
    }

    const now = Date.now();
    const contests: ContestData[] = [];

    for (const contest of data.result) {
        // Only include upcoming and running contests
        if (contest.phase !== "BEFORE" && contest.phase !== "CODING") {
            continue;
        }

        const startTime = new Date(contest.startTimeSeconds * 1000);
        const durationMinutes = Math.floor(contest.durationSeconds / 60);
        const endTime = new Date(startTime.getTime() + contest.durationSeconds * 1000);

        contests.push({
            contestId: String(contest.id),
            name: contest.name,
            startTime,
            endTime,
            duration: durationMinutes,
            url: `https://codeforces.com/contest/${contest.id}`,
            phase: contest.phase,
        });
    }

    return contests.slice(0, 20); // Limit to 20 contests
}

/**
 * Fetch contests from LeetCode
 */
async function fetchLeetCodeContests(): Promise<ContestData[]> {
    const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: `
                query upcomingContests {
                    upcomingContests {
                        title
                        titleSlug
                        startTime
                        duration
                    }
                }
            `,
        }),
        next: { revalidate: 0 },
    });

    if (!response.ok) {
        throw new Error(`LeetCode API error: ${response.status}`);
    }

    const data = await response.json();
    const upcomingContests = data?.data?.upcomingContests || [];

    const contests: ContestData[] = [];

    for (const contest of upcomingContests) {
        const startTime = new Date(contest.startTime * 1000);
        const durationMinutes = Math.floor(contest.duration / 60);
        const endTime = new Date(startTime.getTime() + contest.duration * 1000);

        contests.push({
            contestId: contest.titleSlug,
            name: contest.title,
            startTime,
            endTime,
            duration: durationMinutes,
            url: `https://leetcode.com/contest/${contest.titleSlug}`,
            phase: "BEFORE",
        });
    }

    return contests;
}

/**
 * Fetch contests from AtCoder
 * Uses the unofficial atcoder-problems API
 */
async function fetchAtCoderContests(): Promise<ContestData[]> {
    const response = await fetch(
        "https://kenkoooo.com/atcoder/resources/contests.json",
        { next: { revalidate: 0 } }
    );

    if (!response.ok) {
        throw new Error(`AtCoder API error: ${response.status}`);
    }

    const data = await response.json();
    const now = Date.now() / 1000;

    const contests: ContestData[] = [];

    for (const contest of data) {
        const startTime = new Date(contest.start_epoch_second * 1000);
        const durationMinutes = Math.floor(contest.duration_second / 60);
        const endEpoch = contest.start_epoch_second + contest.duration_second;
        const endTime = new Date(endEpoch * 1000);

        // Only include upcoming or ongoing contests
        if (endEpoch < now) continue;

        const phase = contest.start_epoch_second > now ? "BEFORE" : "CODING";

        contests.push({
            contestId: contest.id,
            name: contest.title,
            startTime,
            endTime,
            duration: durationMinutes,
            url: `https://atcoder.jp/contests/${contest.id}`,
            phase,
        });
    }

    // Sort by start time and limit
    return contests
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        .slice(0, 20);
}

/**
 * Generate notifications for users with reminders
 */
async function generateContestNotifications() {
    const now = new Date();
    const soon = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer

    // Find reminders that should be triggered
    const dueReminders = await prisma.contestReminder.findMany({
        where: {
            notifyAt: { lte: soon },
            notified: false,
        },
        include: {
            contest: true,
        },
    });

    for (const reminder of dueReminders) {
        // Create notification
        await prisma.notification.create({
            data: {
                userId: reminder.userId,
                type: "SYSTEM",
                title: "Contest starting soon",
                body: `${reminder.contest.name} starts in about 1 hour`,
                href: reminder.contest.url,
            },
        });

        // Mark reminder as notified
        await prisma.contestReminder.update({
            where: { id: reminder.id },
            data: { notified: true },
        });
    }
}

// Also support GET for easy testing
export async function GET(request: Request) {
    return POST(request);
}
