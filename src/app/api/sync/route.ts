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
                        leetcodeSlug: problem.titleSlug,
                    },
                },
            })

            if (!existing) {
                // New problem, initial schedule
                const solvedAt = new Date(parseInt(problem.timestamp) * 1000)
                await prisma.revisionProblem.create({
                    data: {
                        userId: user.id,
                        leetcodeSlug: problem.titleSlug,
                        title: problem.title,
                        difficulty: problem.difficulty,
                        url: `https://leetcode.com/problems/${problem.titleSlug}/`,
                        firstSolvedAt: solvedAt,
                        lastSolvedAt: solvedAt,
                        nextReviewAt: getNextReviewDate(0, solvedAt),
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
