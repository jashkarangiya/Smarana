import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getNextReviewDate } from "@/lib/repetition"
import { dateKeyInTz, recomputeStreak } from "@/lib/streak"

// XP values by difficulty (to deduct)
const XP_REWARDS: Record<string, number> = {
    easy: 10,
    medium: 25,
    hard: 50,
}

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, xp: true, timezone: true, streakLastDate: true },
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const problem = await prisma.revisionProblem.findUnique({
        where: { id: params.id },
    })

    if (!problem || problem.userId !== user.id) {
        return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    // Can only undo if reviewCount > 0
    if (problem.reviewCount <= 0) {
        return NextResponse.json({ error: "No reviews to undo" }, { status: 400 })
    }

    const now = new Date()
    const today = startOfDay(now)
    const newReviewCount = problem.reviewCount - 1

    // Recalculate next review date based on previous count
    const nextDate = getNextReviewDate(newReviewCount, problem.firstSolvedAt)

    // Calculate XP to deduct
    const xpToDeduct = XP_REWARDS[problem.difficulty.toLowerCase()] || 10

    const timeZone = user.timezone || "UTC"
    const lastEvent = await prisma.reviewEvent.findFirst({
        where: { userId: user.id, problemId: problem.id },
        orderBy: { reviewedAt: "desc" },
        select: { id: true, dateKey: true },
    })
    const eventDateKey = lastEvent?.dateKey || dateKeyInTz(new Date(), timeZone)

    const daily = await prisma.dailyReviewStat.findUnique({
        where: { userId_dateKey: { userId: user.id, dateKey: eventDateKey } },
        select: { id: true, reviewCount: true },
    })

    const shouldRecompute =
        daily && daily.reviewCount <= 1 && user.streakLastDate === eventDateKey

    const updated = await prisma.$transaction(async (tx) => {
        const updatedProblem = await tx.revisionProblem.update({
            where: { id: problem.id },
            data: {
                reviewCount: newReviewCount,
                nextReviewAt: nextDate,
            },
        })

        await tx.user.update({
            where: { id: user.id },
            data: {
                xp: {
                    decrement: Math.min(xpToDeduct, user.xp || 0),
                },
            },
        })

        if (daily && daily.reviewCount > 1) {
            await tx.dailyReviewStat.update({
                where: { id: daily.id },
                data: { reviewCount: { decrement: 1 } },
            })
        } else if (daily && daily.reviewCount <= 1) {
            await tx.dailyReviewStat.delete({ where: { id: daily.id } })
        }

        if (lastEvent) {
            await tx.reviewEvent.delete({ where: { id: lastEvent.id } })
        }

        return updatedProblem
    })

    if (shouldRecompute) {
        await recomputeStreak(prisma, { userId: user.id, timeZone })
    }

    return NextResponse.json({
        ...updated,
        xpDeducted: xpToDeduct,
        message: "Review undone successfully"
    })
}
