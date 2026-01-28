import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// SM-2 algorithm intervals based on rating
const getNextInterval = (currentInterval: number, rating: "remembered" | "kinda" | "forgot"): number => {
    switch (rating) {
        case "remembered":
            // Good recall - progress to next interval
            if (currentInterval === 0) return 1
            if (currentInterval === 1) return 3
            if (currentInterval === 3) return 7
            if (currentInterval === 7) return 14
            if (currentInterval === 14) return 30
            return Math.min(currentInterval * 2, 90) // Cap at 90 days
        case "kinda":
            // Partial recall - stay at same interval or go back one step
            if (currentInterval <= 1) return 1
            if (currentInterval <= 3) return 1
            if (currentInterval <= 7) return 3
            return Math.max(Math.floor(currentInterval / 2), 1)
        case "forgot":
            // Failed recall - reset to beginning
            return 1
    }
}

// XP rewards based on difficulty and rating
const getXpReward = (difficulty: string, rating: "remembered" | "kinda" | "forgot"): number => {
    const baseXp = {
        easy: 10,
        medium: 25,
        hard: 50,
    }[difficulty.toLowerCase()] || 10

    switch (rating) {
        case "remembered":
            return baseXp
        case "kinda":
            return Math.floor(baseXp * 0.5)
        case "forgot":
            return Math.floor(baseXp * 0.25)
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { rating } = await request.json()

        if (!["remembered", "kinda", "forgot"].includes(rating)) {
            return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
        }

        // Get the problem
        const problem = await prisma.revisionProblem.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        })

        if (!problem) {
            return NextResponse.json({ error: "Problem not found" }, { status: 404 })
        }

        // Calculate new interval and next review date
        const newInterval = getNextInterval(problem.interval, rating)
        const nextReviewAt = new Date()
        nextReviewAt.setDate(nextReviewAt.getDate() + newInterval)

        // Calculate XP reward
        const xpReward = getXpReward(problem.difficulty, rating)

        // Update the problem
        await prisma.revisionProblem.update({
            where: { id },
            data: {
                interval: newInterval,
                nextReviewAt,
                reviewCount: { increment: 1 },
                lastReviewedAt: new Date(),
            },
        })

        // Update user XP
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        const currentXp = user?.xp || 0
        const newXp = currentXp + xpReward
        const currentLevel = user?.level || 1

        // Level up every 500 XP
        const xpPerLevel = 500
        const newLevel = Math.floor(newXp / xpPerLevel) + 1
        const leveledUp = newLevel > currentLevel

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                xp: newXp,
                level: newLevel,
            },
        })

        // Log the review activity (upsert for the day)
        const dayKey = new Date().toISOString().split('T')[0]

        await prisma.reviewLog.upsert({
            where: {
                userId_day: {
                    userId: session.user.id,
                    day: dayKey,
                },
            },
            update: {
                count: { increment: 1 },
                xpEarned: { increment: xpReward },
            },
            create: {
                userId: session.user.id,
                day: dayKey,
                count: 1,
                xpEarned: xpReward,
            },
        })

        return NextResponse.json({
            success: true,
            xpReward,
            newXp,
            newLevel,
            leveledUp,
            newInterval,
            nextReviewAt,
        })
    } catch (error) {
        console.error("Rate error:", error)
        return NextResponse.json({ error: "Failed to rate problem" }, { status: 500 })
    }
}
