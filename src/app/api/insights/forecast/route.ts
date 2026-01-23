import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addDays, format, startOfDay } from "date-fns"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Define forecast range: next 14 days
        const today = startOfDay(new Date())
        const endRange = addDays(today, 14)

        const problems = await prisma.revisionProblem.findMany({
            where: {
                userId,
                nextReviewAt: {
                    gte: today,
                    lte: endRange
                }
            },
            select: { nextReviewAt: true }
        })

        // Group by date
        const forecastMap: Record<string, number> = {}

        // Initialize all 14 days with 0
        for (let i = 0; i < 14; i++) {
            const date = addDays(today, i)
            const key = format(date, "yyyy-MM-dd")
            forecastMap[key] = 0
        }

        problems.forEach(p => {
            const key = format(p.nextReviewAt, "yyyy-MM-dd")
            if (forecastMap[key] !== undefined) {
                forecastMap[key]++
            }
        })

        // Convert to array for Recharts
        const data = Object.entries(forecastMap).map(([date, count]) => ({
            date: format(new Date(date), "MMM d"),
            count
        }))

        return NextResponse.json(data)

    } catch (error) {
        console.error("Forecast API error:", error)
        return NextResponse.json({ error: "Failed to fetch forecast" }, { status: 500 })
    }
}
