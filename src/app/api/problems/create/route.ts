import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { title, url, difficulty, tags, platform = "leetcode" } = body

        if (!title || !url || !difficulty) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

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
        console.error("Create problem error:", error)
        // Check for unique constraint violation
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ error: "You are already tracking this problem" }, { status: 409 })
        }
        return NextResponse.json({ error: "Failed to create problem" }, { status: 500 })
    }
}
