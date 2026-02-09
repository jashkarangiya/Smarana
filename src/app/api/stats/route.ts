import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { subDays, format } from "date-fns"
import { dateKeyInTz, getEffectiveStreak } from "@/lib/streak"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stats: true }
    })

    if (!user) {
        return new NextResponse("User not found", { status: 404 })
    }

    // Get all problems for the user
    const problems = await prisma.revisionProblem.findMany({
        where: { userId: user.id },
    })

    // Count by difficulty
    const easy = problems.filter(p => p.difficulty.toLowerCase() === "easy").length
    const medium = problems.filter(p => p.difficulty.toLowerCase() === "medium").length
    const hard = problems.filter(p => p.difficulty.toLowerCase() === "hard").length

    // Get review logs for last 365 days (for heatmap)
    const oneYearAgoDate = subDays(new Date(), 365)
    const oneYearAgoStr = format(oneYearAgoDate, "yyyy-MM-dd")

    const reviewLogs = await prisma.dailyReviewStat.findMany({
        where: {
            userId: user.id,
            dateKey: { gte: oneYearAgoStr },
        },
        orderBy: { dateKey: "asc" },
    })

    // Build heatmap data (date string -> count)
    const heatmapData: Record<string, number> = {}
    reviewLogs.forEach(log => {
        heatmapData[log.dateKey] = log.reviewCount
    })

    const timeZone = user.timezone || "UTC"
    const todayKey = dateKeyInTz(new Date(), timeZone)
    const reviewedToday = reviewLogs.find(log => log.dateKey === todayKey)?.reviewCount || 0

    const streak = getEffectiveStreak({
        streakCurrent: user.streakCurrent,
        streakLastDate: user.streakLastDate,
        now: new Date(),
        timeZone,
    })

    // Calculate level from XP (500 XP per level)
    const level = Math.floor((user.xp || 0) / 500) + 1
    const xpForNextLevel = level * 500
    const xpProgress = ((user.xp || 0) % 500) / 500 * 100

    // Calculate achievements
    const achievements = []

    if (problems.length >= 1) {
        achievements.push({ id: "first-flame", name: "First Flame", emoji: "🔥", description: "Complete your first review" })
    }
    if (streak >= 7) {
        achievements.push({ id: "week-warrior", name: "Week Warrior", emoji: "📅", description: "7-day streak" })
    }
    if (streak >= 30) {
        achievements.push({ id: "month-master", name: "Month Master", emoji: "🏆", description: "30-day streak" })
    }
    if (problems.length >= 100) {
        achievements.push({ id: "century", name: "Century", emoji: "💯", description: "Review 100 problems" })
    }
    if (reviewedToday >= 5) {
        achievements.push({ id: "speed-demon", name: "Speed Demon", emoji: "⚡", description: "Review 5 problems in one day" })
    }

    return NextResponse.json({
        total: problems.length,
        easy,
        medium,
        hard,
        reviewedToday,
        streak,
        xp: user.xp || 0,
        level,
        xpForNextLevel,
        xpProgress,
        heatmapData,
        achievements,
    })
}
