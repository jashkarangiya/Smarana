import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getNextReviewDate } from "@/lib/repetition"
import { fetchLeetCodeSolvedProblems, fetchLeetCodeStats } from "@/lib/platforms/leetcode"
import { fetchCodeforcesSolvedProblems } from "@/lib/platforms/codeforces"
import { fetchAtCoderSolvedProblems } from "@/lib/platforms/atcoder"
import { PlatformProblem } from "@/lib/platforms"

export async function POST() {
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

    // Check if any platform is connected
    const hasAnyPlatform = user.leetcodeUsername || user.codeforcesUsername || user.atcoderUsername
    if (!hasAnyPlatform) {
        return new NextResponse("No platform connected. Please connect a platform first.", { status: 400 })
    }

    try {
        let totalAdded = 0
        const results: Record<string, number> = {}

        // Sync LeetCode
        if (user.leetcodeUsername) {
            const [problems, stats] = await Promise.all([
                fetchLeetCodeSolvedProblems(user.leetcodeUsername),
                fetchLeetCodeStats(user.leetcodeUsername)
            ])

            const added = await syncProblems(user.id, "leetcode", problems)

            if (stats?.submissionCalendar) {
                // Update stats
                await prisma.userStats.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        leetcodeActivity: stats.submissionCalendar
                    },
                    update: {
                        leetcodeActivity: stats.submissionCalendar
                    }
                })
            }

            results.leetcode = added
            totalAdded += added
        }

        // Sync Codeforces
        if (user.codeforcesUsername) {
            const problems = await fetchCodeforcesSolvedProblems(user.codeforcesUsername)
            const added = await syncProblems(user.id, "codeforces", problems)
            results.codeforces = added
            totalAdded += added
        }

        // Sync AtCoder
        if (user.atcoderUsername) {
            const problems = await fetchAtCoderSolvedProblems(user.atcoderUsername)
            const added = await syncProblems(user.id, "atcoder", problems)
            results.atcoder = added
            totalAdded += added
        }

        return NextResponse.json({
            message: "Sync complete",
            added: totalAdded,
            details: results,
        })
    } catch (error) {
        console.error("Sync failed:", error)
        return new NextResponse("Sync failed", { status: 500 })
    }
}

async function syncProblems(userId: string, platform: string, problems: PlatformProblem[]): Promise<number> {
    let addedCount = 0

    for (const problem of problems) {
        // Check if problem already exists for this user on this platform
        const existing = await prisma.revisionProblem.findUnique({
            where: {
                userId_platform_problemSlug: {
                    userId,
                    platform,
                    problemSlug: problem.problemSlug,
                },
            },
        })

        if (!existing) {
            // New problem, initial schedule
            await prisma.revisionProblem.create({
                data: {
                    userId,
                    platform,
                    problemSlug: problem.problemSlug,
                    title: problem.title,
                    difficulty: problem.difficulty,
                    url: problem.url,
                    firstSolvedAt: problem.solvedAt,
                    lastSolvedAt: problem.solvedAt,
                    nextReviewAt: getNextReviewDate(0, problem.solvedAt),
                    reviewCount: 0,
                },
            })
            addedCount++
        }
    }

    return addedCount
}
