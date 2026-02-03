import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reminderSchema = z.object({
    contestId: z.string().min(1),
});

/**
 * POST /api/contests/reminder
 *
 * Add a reminder for a contest.
 * By default, reminds 1 hour before contest starts.
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = reminderSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { contestId } = validation.data;

        // Get the contest
        const contest = await prisma.contest.findUnique({
            where: { id: contestId },
        });

        if (!contest) {
            return NextResponse.json(
                { error: "Contest not found" },
                { status: 404 }
            );
        }

        // Calculate notify time (1 hour before start)
        const notifyAt = new Date(contest.startTime.getTime() - 60 * 60 * 1000);

        // Create or update reminder
        await prisma.contestReminder.upsert({
            where: {
                userId_contestId: {
                    userId: session.user.id,
                    contestId,
                },
            },
            update: { notifyAt, notified: false },
            create: {
                userId: session.user.id,
                contestId,
                notifyAt,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating reminder:", error);
        return NextResponse.json(
            { error: "Failed to create reminder" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/contests/reminder
 *
 * Remove a reminder for a contest.
 */
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = reminderSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { contestId } = validation.data;

        await prisma.contestReminder.deleteMany({
            where: {
                userId: session.user.id,
                contestId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting reminder:", error);
        return NextResponse.json(
            { error: "Failed to delete reminder" },
            { status: 500 }
        );
    }
}
