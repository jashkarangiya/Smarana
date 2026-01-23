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

        // Reset progress: set interval to 0 and next review to tomorrow
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(9, 0, 0, 0) // Set to 9 AM

        const problem = await prisma.revisionProblem.update({
            where: { id },
            data: {
                interval: 0,
                reviewCount: 0,
                nextReviewAt: tomorrow,
                lastReviewedAt: null,
            },
        })

        return NextResponse.json({ success: true, problem })
    } catch (error) {
        console.error("Reset error:", error)
        return NextResponse.json({ error: "Failed to reset progress" }, { status: 500 })
    }
}
