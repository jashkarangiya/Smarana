import { prisma } from "@/lib/prisma"
import { getNextReviewDate } from "@/lib/repetition"
import { NextResponse } from "next/server"
import { fetchLeetCodeSolvedProblems } from "@/lib/platforms/leetcode"
import { fetchCodeforcesSolvedProblems } from "@/lib/platforms/codeforces"
import { fetchAtCoderSolvedProblems } from "@/lib/platforms/atcoder"
import { PlatformProblem } from "@/lib/platforms"
import { sendEmail } from "@/lib/email/sendEmail"
import { reviewReminderEmail } from "@/lib/email/templates/reviewReminder"
import { getBaseUrl } from "@/lib/baseUrl"

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

        // Send Reminders
        const remindersSent = await sendReminders()

        return NextResponse.json({
            success: true,
            usersProcessed: users.length,
            problemsAdded: totalAdded,
            remindersSent,
        })
    } catch (error) {
        console.error("Cron sync failed:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

async function sendReminders(): Promise<number> {
    const now = new Date()
    const reviewUrl = `${process.env.NEXTAUTH_URL}/review` // Check correct URL

    // Find users who want reminders
    const users = await prisma.user.findMany({
        where: {
            email: { not: null },
            emailReviewRemindersEnabled: true,
        },
        select: {
            id: true,
            email: true,
            name: true,
            lastReviewReminderSentAt: true,
            timezone: true,
        },
    })

    let sentCount = 0

    for (const u of users) {
        // 1. Check cooldown (24h)
        if (u.lastReviewReminderSentAt) {
            const diff = now.getTime() - u.lastReviewReminderSentAt.getTime()
            if (diff < 24 * 60 * 60 * 1000) continue
        }

        // 2. Count due problems
        // We need to count problems where nextReviewAt <= now
        const dueCount = await prisma.revisionProblem.count({
            where: {
                userId: u.id,
                nextReviewAt: { lte: now },
            },
        })

        if (dueCount <= 0) continue

        // 3. Send email
        try {
            const appUrl = getBaseUrl()
            const logoUrl = `${appUrl}/brand/logo-email.png`

            const { subject, html, text } = reviewReminderEmail({
                appUrl,
                logoUrl,
                username: u.name,
                dueCount,
                reviewUrl,
            })

            await sendEmail({
                to: u.email!,
                subject,
                html,
                text,
            })

            // 4. Update last sent time
            await prisma.user.update({
                where: { id: u.id },
                data: { lastReviewReminderSentAt: now },
            })

            sentCount++
        } catch (e) {
            console.error(`Failed to send reminder to ${u.email}:`, e)
        }
    }

    return sentCount
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
