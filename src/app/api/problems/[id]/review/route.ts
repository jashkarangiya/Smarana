import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getNextReviewDate } from "@/lib/repetition"

// XP values by difficulty
const XP_REWARDS: Record<string, number> = {
    easy: 10,
    medium: 25,
    hard: 50,
}

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { rating } = await req.json().catch(() => ({ rating: 3 })) // Default to 'Good' if not provided

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return new NextResponse("User not found", { status: 404 })
    }

    const problem = await prisma.revisionProblem.findUnique({
        where: { id: params.id },
    })

    if (!problem || problem.userId !== user.id) {
        return new NextResponse("Problem not found", { status: 404 })
    }

    const now = new Date()
    // Normalize to midnight for daily logging
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const newReviewCount = problem.reviewCount + 1

    // Calculate next interval based on rating (optional: pass rating to getNextReviewDate)
    // For now assuming getNextReviewDate handles simple increment, or we just pass count
    // Ideally getNextReviewDate should accept quality.
    const nextDate = getNextReviewDate(newReviewCount, now)

    // Calculate new interval (days between now and nextDate)
    const newInterval = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate XP reward
    const baseXp = XP_REWARDS[problem.difficulty.toLowerCase()] || 10
    // Bonus for streak or perfect rating? Keep simple for now.
    const xpEarned = baseXp

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Log the immutable event
            await tx.reviewEvent.create({
                data: {
                    userId: user.id,
                    problemId: problem.id,
                    rating: Number(rating) || 3,
                    interval: newInterval,
                    xpEarned: xpEarned,
                    reviewedAt: now,
                }
            })

            // 2. Update the problem
            const updatedProblem = await tx.revisionProblem.update({
                where: { id: problem.id },
                data: {
                    lastSolvedAt: now,
                    reviewCount: { increment: 1 },
                    nextReviewAt: nextDate,
                    interval: newInterval,
                    lastReviewedAt: now,
                },
            })

            // 3. Update User XP
            await tx.user.update({
                where: { id: user.id },
                data: { xp: { increment: xpEarned } },
            })

            // 4. Update Daily Log (Aggregated)
            await tx.reviewLog.upsert({
                where: {
                    userId_date: {
                        userId: user.id,
                        date: today,
                    },
                },
                update: {
                    count: { increment: 1 },
                    xpEarned: { increment: xpEarned },
                },
                create: {
                    userId: user.id,
                    date: today,
                    count: 1,
                    xpEarned: xpEarned,
                },
            })

            // 5. Update User Stats (Totals & Streak)
            // Note: Streak logic usually requires checking yesterday's log. 
            // For MVP transaction speed, we might just increment totals here 
            // and have a background job or separate check for strict streak calculation.
            // Or simple check:

            const stats = await tx.userStats.findUnique({ where: { userId: user.id } })

            let newStreak = stats?.currentStreak || 0
            const lastReviewed = stats?.lastReviewedAt ? new Date(stats.lastReviewedAt) : null

            // If last review was yesterday (UTC), increment streak. 
            // If today, keep same. 
            // If older, reset to 1.

            // Simple approach: we trust the 'dayKey' helps us here? 
            // Logic is complex to do inside transaction without reading logs.
            // Let's just update lastReviewedAt and totalReviews for now. 
            // Real streak calc is better done in a dedicated service or simplified.

            await tx.userStats.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    totalReviews: 1,
                    lastReviewedAt: now,
                    currentStreak: 1
                },
                update: {
                    totalReviews: { increment: 1 },
                    lastReviewedAt: now,
                    // We leave streak management to a separate robust logic or "Daily Challenge" check
                }
            })

            return updatedProblem
        })

        return NextResponse.json({ ...result, xpEarned })

    } catch (error) {
        console.error("Review transaction failed:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
