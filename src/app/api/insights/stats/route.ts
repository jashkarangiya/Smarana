import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEffectiveStreak } from "@/lib/streak"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // 1. Total Reviews (from DailyReviewStat)
        const totalReviewsAgg = await prisma.dailyReviewStat.aggregate({
            _sum: { reviewCount: true },
            where: { userId },
        })
        const totalReviews = totalReviewsAgg._sum.reviewCount || 0

        // 2. Current Streak (timezone-aware)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { xp: true, level: true, streakCurrent: true, streakLastDate: true, timezone: true },
        })
        const currentStreak = user
            ? getEffectiveStreak({
                streakCurrent: user.streakCurrent,
                streakLastDate: user.streakLastDate,
                now: new Date(),
                timeZone: user.timezone || "UTC",
            })
            : 0

        // 3. Level & XP

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
