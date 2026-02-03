import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/contests
 *
 * Returns upcoming contests from all platforms.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();

        // Fetch upcoming and ongoing contests
        const contests = await prisma.contest.findMany({
            where: {
                OR: [
                    { phase: "BEFORE", startTime: { gte: now } },
                    { phase: "CODING" },
                ],
            },
            orderBy: { startTime: "asc" },
            take: 50,
        });

        // Get user's reminders
        const reminders = await prisma.contestReminder.findMany({
            where: {
                userId: session.user.id,
                contestId: { in: contests.map((c) => c.id) },
            },
            select: { contestId: true },
        });

        const reminderSet = new Set(reminders.map((r) => r.contestId));

        // Add hasReminder flag to contests
        const contestsWithReminders = contests.map((c) => ({
            ...c,
            hasReminder: reminderSet.has(c.id),
        }));

        return NextResponse.json({ contests: contestsWithReminders });
    } catch (error) {
        console.error("Error fetching contests:", error);
        return NextResponse.json(
            { error: "Failed to fetch contests" },
            { status: 500 }
        );
    }
}
