import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getNextReviewDate } from "@/lib/repetition"
import { startOfDay } from "date-fns"

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
    const today = startOfDay(now)
    const newReviewCount = problem.reviewCount + 1
    const nextDate = getNextReviewDate(newReviewCount, now)

    // Calculate XP reward
    const xpEarned = XP_REWARDS[problem.difficulty.toLowerCase()] || 10

    // Update problem
    const updated = await prisma.revisionProblem.update({
        where: { id: problem.id },
        data: {
            lastSolvedAt: now,
            reviewCount: newReviewCount,
            nextReviewAt: nextDate,
        },
    })

    // Update user XP
    await prisma.user.update({
        where: { id: user.id },
        data: { xp: { increment: xpEarned } },
    })

    // Log the review for heatmap (upsert for daily aggregate)
    await prisma.reviewLog.upsert({
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

    return NextResponse.json({ ...updated, xpEarned })
}
