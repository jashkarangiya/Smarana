import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { fetchRecentSolvedProblems } from "@/lib/leetcode"
import { getNextReviewDate } from "@/lib/repetition"

export async function POST() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user || !user.leetcodeUsername) {
        return new NextResponse("LeetCode username not set", { status: 400 })
    }

    try {
        const recentProblems = await fetchRecentSolvedProblems(user.leetcodeUsername)
        let addedCount = 0

        for (const problem of recentProblems) {
            // Check if problem already exists for this user
            const existing = await prisma.revisionProblem.findUnique({
                where: {
                    userId_leetcodeSlug: {
                        userId: user.id,
                        leetcodeSlug: problem.slug,
                    },
                },
            })

            if (!existing) {
                // New problem, initial schedule
                await prisma.revisionProblem.create({
                    data: {
                        userId: user.id,
                        leetcodeSlug: problem.slug,
                        title: problem.title,
                        difficulty: problem.difficulty,
                        url: problem.url,
                        firstSolvedAt: problem.timestamp,
                        lastSolvedAt: problem.timestamp,
                        nextReviewAt: getNextReviewDate(0, problem.timestamp),
                        reviewCount: 0,
                    },
                })
                addedCount++
            }
        }

        return NextResponse.json({
            message: "Sync complete",
            added: addedCount,
        })
    } catch (error) {
        console.error("Sync failed:", error)
        return new NextResponse("Sync failed", { status: 500 })
    }
}
