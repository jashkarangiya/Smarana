import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { startOfDay, endOfDay, addDays } from "date-fns"
import { safeDecrypt } from "@/lib/encryption"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const filter = searchParams.get("filter") // 'today', 'due', 'upcoming'

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return new NextResponse("User not found", { status: 404 })
    }

    let whereClause: any = { userId: user.id }
    const now = new Date()

    if (filter === "solved-today") {
        whereClause.lastSolvedAt = {
            gte: startOfDay(now),
            lte: endOfDay(now),
        }
    } else if (filter === "due") {
        whereClause.nextReviewAt = {
            lte: endOfDay(now),
        }
    } else if (filter === "upcoming") {
        whereClause.nextReviewAt = {
            gt: endOfDay(now),
        }
    }

    const problems = await prisma.revisionProblem.findMany({
        where: whereClause,
        orderBy: { nextReviewAt: "asc" },
    })

    // Decrypt sensitive fields for each problem
    const decryptedProblems = problems.map(problem => ({
        ...problem,
        notes: safeDecrypt(problem.notes),
        solution: safeDecrypt(problem.solution),
    }))

    return NextResponse.json(decryptedProblems)
}
