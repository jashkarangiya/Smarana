import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { startOfDay, endOfDay, addDays } from "date-fns"
import { safeDecrypt } from "@/lib/encryption"
import { problemCreateSchema } from "@/lib/validations/problem"
import { handleApiError } from "@/lib/api-error"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined
    const filter = searchParams.get("filter") // 'today', 'due', 'upcoming'

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return new NextResponse("User not found", { status: 404 })
    }

    const whereClause: any = { userId: user.id }
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
        take: limit,
    })

    // Decrypt sensitive fields for each problem
    const decryptedProblems = problems.map(problem => ({
        ...problem,
        notes: safeDecrypt(problem.notes),
        solution: safeDecrypt(problem.solution),
    }))

    return NextResponse.json(decryptedProblems)
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()

        // Validate with Zod
        const validation = problemCreateSchema.safeParse(body)
        if (!validation.success) {
            const errorMsg = validation.error.issues[0].message
            return NextResponse.json({ error: errorMsg }, { status: 400 })
        }

        const { title, url, difficulty, platform = "leetcode" } = validation.data

        // Extract slug from URL if possible, otherwise use timestamp
        let problemSlug = `manual-${Date.now()}`
        if (url.includes("/problems/")) {
            problemSlug = url.split("/problems/")[1].split("/")[0]
        }

        // Create the problem
        const problem = await prisma.revisionProblem.create({
            data: {
                userId: session.user.id,
                title,
                url,
                difficulty,
                platform,
                problemSlug,
                firstSolvedAt: new Date(),
                lastSolvedAt: new Date(),
                nextReviewAt: new Date(), // Due immediately
                interval: 0,
                reviewCount: 0,
            }
        })

        return NextResponse.json(problem)
    } catch (error) {
        return handleApiError(error)
    }
}
