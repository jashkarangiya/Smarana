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

        // 1. Total Reviews (from ReviewLog)
        const totalReviewsAgg = await prisma.reviewLog.aggregate({
            _sum: { count: true },
            where: { userId },
        })
        const totalReviews = totalReviewsAgg._sum.count || 0

        // 2. Current Streak
        const recentLogs = await prisma.reviewLog.findMany({
            where: { userId },
            orderBy: { day: "desc" },
            take: 365,
        })

        let currentStreak = 0
        const today = new Date()
        const todayString = today.toISOString().split('T')[0]

        // Create a Set of day strings for O(1) lookup
        const logMap = new Set(recentLogs.map(l => l.day))

        // Determine starting point for streak check
        // Check if we have an entry for today
        let checkDateString = todayString

        if (!logMap.has(todayString)) {
            // If no review today, check yesterday
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayString = yesterday.toISOString().split('T')[0]

            if (!logMap.has(yesterdayString)) {
                // No review yesterday either -> Streak is 0
                checkDateString = ""
            } else {
                checkDateString = yesterdayString
            }
        }

        if (checkDateString) {
            currentStreak = 0

            // Start counting from checkDate backwards
            const pointer = new Date(checkDateString)

            while (true) {
                const pointerString = pointer.toISOString().split('T')[0]
                if (logMap.has(pointerString)) {
                    currentStreak++
                    pointer.setDate(pointer.getDate() - 1)
                } else {
                    break
                }
            }
        }

        // 3. Level & XP
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { xp: true, level: true },
        })

        // 4. Mastery Score & Stats
        const problems = await prisma.revisionProblem.findMany({
            where: { userId },
            select: { interval: true, difficulty: true },
        })

        const totalProblems = problems.length
        const totalIntervals = problems.reduce((acc, p) => acc + p.interval, 0)
        const masteryScore = totalProblems > 0 ? Math.round(totalIntervals / totalProblems) : 0

        const masteredCount = problems.filter(p => p.interval > 30).length

        // 5. Difficulty Distribution
        const difficulties = {
            easy: 0,
            medium: 0,
            hard: 0
        }

        // Manual aggregation from fetched problems to avoid another DB call if possible, 
        // or just use what we have. We fetched difficulty above.
        problems.forEach(p => {
            const diff = p.difficulty.toLowerCase() as keyof typeof difficulties
            if (difficulties[diff] !== undefined) {
                difficulties[diff]++
            }
        })

        return NextResponse.json({
            stats: {
                totalReviews,
                currentStreak,
                level: user?.level || 1,
                xp: user?.xp || 0,
                masteryScore,
                masteredCount,
                totalProblems,
                difficulties
            }
        })

    } catch (error) {
        console.error("Stats error:", error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
