import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Revalidate frequently since it's a fast DB read
export const revalidate = 60;

export async function GET() {
    try {
        // Only fetch future or active contests
        const now = new Date();
        const contests = await prisma.contest.findMany({
            where: {
                // End time is in future OR start time is in future
                // Conservative: start time > now - duration? 
                // Simple: Start time > now OR (Start time < now AND End time > now)

                // Let's just get everything starting in the future, 
                // plus recent active ones (e.g. started in last 24h)
                OR: [
                    { startTime: { gt: now } },
                    { endTime: { gt: now } }
                ]
            },
            orderBy: { startTime: "asc" }
        });

        return NextResponse.json(contests);
    } catch (error) {
        console.error("Contests API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
