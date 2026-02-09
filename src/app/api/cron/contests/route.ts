
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllContests } from "@/lib/contests/fetchers";

// Vercel Cron protection
// This route should be called by Vercel Cron (or manually with secret)
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            // For now, open to allow manual testing as per plan
        }

        console.log("Starting contest sync...");

        // 1. Fetch from external sources
        const allContests = await fetchAllContests();

        // 2. Filter: Next 7 days only
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const upcomingContests = allContests.filter(c => {
            const start = new Date(c.startsAt);
            return start > now && start < sevenDaysFromNow;
        });

        console.log(`Fetched ${allContests.length}, filtering to ${upcomingContests.length} upcoming (7 days)`);

        // 3. Upsert to DB
        let upsertedCount = 0;
        for (const c of upcomingContests) {
            const startTime = new Date(c.startsAt);
            const endTime = new Date(startTime.getTime() + (c.durationSeconds * 1000));

            await prisma.contest.upsert({
                where: {
                    platform_contestId: {
                        platform: c.platform,
                        contestId: c.id
                    }
                },
                update: {
                    name: c.name,
                    startTime,
                    endTime,
                    duration: Math.floor(c.durationSeconds / 60), // Store in minutes
                    url: c.url,
                    phase: c.phase, // BEFORE | CODING
                },
                create: {
                    platform: c.platform,
                    contestId: c.id,
                    name: c.name,
                    startTime,
                    endTime,
                    duration: Math.floor(c.durationSeconds / 60),
                    url: c.url,
                    phase: c.phase,
                }
            });
            upsertedCount++;
        }

        return NextResponse.json({
            success: true,
            fetched: allContests.length,
            processed: upcomingContests.length,
            upserted: upsertedCount
        });

    } catch (error) {
        console.error("Cron Contest Sync Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
