import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

        const { days } = await request.json()

        if (!days || isNaN(days)) {
            return NextResponse.json({ error: "Invalid days" }, { status: 400 })
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

        // Calculate new review date
        const nextReviewAt = new Date()
        nextReviewAt.setDate(nextReviewAt.getDate() + days)
        // Keep the original time if possible or set to a default review time (e.g., 9 AM)
        nextReviewAt.setHours(9, 0, 0, 0)

        // Update the problem
        await prisma.revisionProblem.update({
            where: { id },
            data: {
                nextReviewAt,
            },
        })

        return NextResponse.json({ success: true, nextReviewAt })
    } catch (error) {
        console.error("Snooze error:", error)
        return NextResponse.json({ error: "Failed to snooze problem" }, { status: 500 })
    }
}
