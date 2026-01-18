import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getNextReviewDate } from "@/lib/repetition"

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
    const newReviewCount = problem.reviewCount + 1
    const nextDate = getNextReviewDate(newReviewCount, now)

    const updated = await prisma.revisionProblem.update({
        where: { id: problem.id },
        data: {
            lastSolvedAt: now,
            reviewCount: newReviewCount,
            nextReviewAt: nextDate,
        },
    })

    return NextResponse.json(updated)
}
