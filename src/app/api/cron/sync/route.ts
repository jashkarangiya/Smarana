import { prisma } from "@/lib/prisma"
import { getNextReviewDate } from "@/lib/repetition"
import { NextResponse } from "next/server"
import { fetchLeetCodeSolvedProblems } from "@/lib/platforms/leetcode"
import { fetchCodeforcesSolvedProblems } from "@/lib/platforms/codeforces"
import { fetchAtCoderSolvedProblems } from "@/lib/platforms/atcoder"
import { PlatformProblem } from "@/lib/platforms"

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization")

    // Simple secret check (e.g. Bearer my-secret)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // Find all users with any platform username
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { leetcodeUsername: { not: null } },
                    { codeforcesUsername: { not: null } },
                    { atcoderUsername: { not: null } },
                ],
            },
        })

        let totalAdded = 0

        for (const user of users) {
            // Sync LeetCode
            if (user.leetcodeUsername) {
                const problems = await fetchLeetCodeSolvedProblems(user.leetcodeUsername)
                totalAdded += await syncProblems(user.id, "leetcode", problems)
            }

            // Sync Codeforces
            if (user.codeforcesUsername) {
                const problems = await fetchCodeforcesSolvedProblems(user.codeforcesUsername)
                totalAdded += await syncProblems(user.id, "codeforces", problems)
            }

            // Sync AtCoder
            if (user.atcoderUsername) {
                const problems = await fetchAtCoderSolvedProblems(user.atcoderUsername)
                totalAdded += await syncProblems(user.id, "atcoder", problems)
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

async function syncProblems(userId: string, platform: string, problems: PlatformProblem[]): Promise<number> {
    let addedCount = 0

    for (const problem of problems) {
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
