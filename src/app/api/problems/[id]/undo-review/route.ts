import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getNextReviewDate } from "@/lib/repetition"
import { startOfDay, subDays } from "date-fns"

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

    // Update problem - revert review
    const updated = await prisma.revisionProblem.update({
        where: { id: problem.id },
        data: {
            reviewCount: newReviewCount,
            nextReviewAt: nextDate,
            // Keep lastSolvedAt as is or revert to previous? Keeping as is for simplicity
        },
    })

    // Deduct user XP (don't go below 0)
    await prisma.user.update({
        where: { id: user.id },
        data: {
            xp: {
                decrement: Math.min(xpToDeduct, user.xp || 0)
            }
        },
    })

    // Update ReviewLog - decrement count for today
    // We assume undo happens on the same day usually, or we decrement the day the undo happens.
    // Ideally we should decrement the log of the actual review day, but we don't store "reviewLogId" in ReviewEvent easily accessible here without query.
    // For MVP, simplistic approach: decrement today's count if > 0. 
    // Correction: If the user reviews today and undoes today, this is correct.
    const dayKey = new Date().toISOString().split('T')[0]

    const existingLog = await prisma.reviewLog.findUnique({
        where: {
            userId_day: {
                userId: user.id,
                day: dayKey,
            },
        },
    })

    if (existingLog && existingLog.count > 0) {
        if (existingLog.count === 1) {
            // Delete the log entry if this was the only review
            await prisma.reviewLog.delete({
                where: { id: existingLog.id },
            })
        } else {
            // Decrement count
            await prisma.reviewLog.update({
                where: { id: existingLog.id },
                data: {
                    count: { decrement: 1 },
                    xpEarned: { decrement: xpToDeduct },
                },
            })
        }
    }

    return NextResponse.json({
        ...updated,
        xpDeducted: xpToDeduct,
        message: "Review undone successfully"
    })
}
