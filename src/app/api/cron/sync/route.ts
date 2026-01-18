import { prisma } from "@/lib/prisma"
import { fetchRecentSolvedProblems } from "@/lib/leetcode"
import { getNextReviewDate } from "@/lib/repetition"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const authHeader = req.headers.get("authorization")

    // Simple secret check (e.g. Bearer my-secret)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // Find all users with a leetcode username
        const users = await prisma.user.findMany({
            where: {
                leetcodeUsername: {
                    not: null,
                },
            },
        })

        let totalAdded = 0

        for (const user of users) {
            if (!user.leetcodeUsername) continue

            const recentProblems = await fetchRecentSolvedProblems(user.leetcodeUsername)

            for (const problem of recentProblems) {
                const existing = await prisma.revisionProblem.findUnique({
                    where: {
                        userId_leetcodeSlug: {
                            userId: user.id,
                            leetcodeSlug: problem.slug,
                        },
                    },
                })

                if (!existing) {
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
                    totalAdded++
                }
            }
        }

        return NextResponse.json({
            success: true,
            usersProcessed: users.length,
            problemsAdded: totalAdded,
        })
    } catch (error) {
        console.error("Cron sync failed:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
