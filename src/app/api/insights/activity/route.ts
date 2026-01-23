import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Fetch all logs for the user
        // Optimizing: Could limit to last year if dataset grows large, but for now fetch all
        const logs = await prisma.reviewLog.findMany({
            where: { userId },
            select: { date: true, count: true },
        })

        // Transform to formatted object: { "YYYY-MM-DD": count }
        const data: Record<string, number> = {}

        logs.forEach(log => {
            const dateStr = log.date.toISOString().split('T')[0]
            data[dateStr] = log.count
        })

        return NextResponse.json(data)

    } catch (error) {
        console.error("Activity API error:", error)
        return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
    }
}
