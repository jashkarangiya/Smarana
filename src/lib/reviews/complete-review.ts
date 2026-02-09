import type { Prisma, PrismaClient } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getNextReviewDate } from "@/lib/repetition"
import { safeDecrypt } from "@/lib/encryption"
import { calculateReviewXP } from "@/lib/xp"
import { ACHIEVEMENTS, AchievementContext } from "@/lib/achievements"
import { dateKeyInTz, recordReviewForStreak } from "@/lib/streak"

type PrismaTx = PrismaClient | Prisma.TransactionClient

type CompleteReviewInput = {
    userId: string
    problemId: string
    rating: number
    source: "web" | "extension"
    timeSpentMs?: number
    clientEventId?: string
    timeZone: string
}

type ReviewResult = {
    problem: any
    xpEarned: number
    achievementBonusXP: number
    newAchievements: string[]
    notes: string
    solution: string
}

async function buildReviewResponse(tx: PrismaTx, userId: string, problemId: string) {
    const problem = await tx.revisionProblem.findUnique({
        where: { id: problemId },
    })
    if (!problem) {
        return null
    }

    return {
        problem,
        notes: safeDecrypt(problem.notes || ""),
        solution: safeDecrypt(problem.solution || ""),
        xpEarned: 0,
        achievementBonusXP: 0,
        newAchievements: [],
    } satisfies ReviewResult
}

export async function completeReview(input: CompleteReviewInput): Promise<ReviewResult> {
    const now = new Date()
    const timeZone = input.timeZone || "UTC"
    const todayKey = dateKeyInTz(now, timeZone)

    return prisma.$transaction(async (tx) => {
        const existingDaily = await tx.dailyReviewStat.findUnique({
            where: { userId_dateKey: { userId: input.userId, dateKey: todayKey } },
            select: { id: true },
        })
        if (input.clientEventId) {
            const existing = await tx.reviewEvent.findUnique({
                where: {
                    userId_clientEventId: {
                        userId: input.userId,
                        clientEventId: input.clientEventId,
                    },
                },
                select: { id: true },
            })

            if (existing) {
                const existingResult = await buildReviewResponse(tx, input.userId, input.problemId)
                if (existingResult) return existingResult
            }
        }

        const problem = await tx.revisionProblem.findUnique({
            where: { id: input.problemId },
        })

        if (!problem || problem.userId !== input.userId) {
            throw new Error("Problem not found")
        }

        const xpEarned = calculateReviewXP(problem.difficulty, Number(input.rating), !existingDaily)

        const newReviewCount = problem.reviewCount + 1
        const nextDate = getNextReviewDate(newReviewCount, now)
        const newInterval = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        const updatedProblem = await tx.revisionProblem.update({
            where: { id: problem.id },
            data: {
                lastSolvedAt: now,
                reviewCount: { increment: 1 },
                nextReviewAt: nextDate,
                interval: newInterval,
                lastReviewedAt: now,
            },
        })

        await tx.reviewEvent.create({
            data: {
                userId: input.userId,
                problemId: problem.id,
                rating: Number(input.rating) || 3,
                source: input.source,
                timeSpentMs: input.timeSpentMs,
                clientEventId: input.clientEventId,
                interval: newInterval,
                xpEarned,
                reviewedAt: now,
                dateKey: todayKey,
                timezone: timeZone,
            },
        })

        const streak = await recordReviewForStreak(tx, {
            userId: input.userId,
            timeZone,
            now,
        })

        const stats = await tx.userStats.upsert({
            where: { userId: input.userId },
            create: {
                userId: input.userId,
                totalReviews: 1,
                lastReviewedAt: now,
                currentStreak: streak.streakCurrent,
                longestStreak: streak.streakLongest,
                reviewsThisWeek: 1,
            },
            update: {
                totalReviews: { increment: 1 },
                lastReviewedAt: now,
                reviewsThisWeek: { increment: 1 },
                currentStreak: streak.streakCurrent,
                longestStreak: streak.streakLongest,
            },
        })

        const problemsTracked = await tx.revisionProblem.count({ where: { userId: input.userId } })
        const friendsCount = await tx.friendship.count({ where: { userId: input.userId } })

        const ctx: AchievementContext = {
            totalReviews: stats.totalReviews + 1,
            currentStreak: streak.streakCurrent,
            longestStreak: streak.streakLongest,
            problemsTracked,
            friendsCount,
        }

        const unlockedNow: string[] = []
        let achievementBonusXP = 0
        const currentlyUnlocked = new Set(stats.unlockedAchievements)

        for (const ach of ACHIEVEMENTS) {
            if (!currentlyUnlocked.has(ach.id) && ach.isUnlocked(ctx)) {
                unlockedNow.push(ach.id)
                achievementBonusXP += ach.xpReward
            }
        }

        const totalXpGain = xpEarned + achievementBonusXP
        await tx.user.update({
            where: { id: input.userId },
            data: { xp: { increment: totalXpGain } },
        })

        if (unlockedNow.length > 0) {
            await tx.userStats.update({
                where: { userId: input.userId },
                data: {
                    unlockedAchievements: { push: unlockedNow },
                },
            })
        }

        return {
            problem: updatedProblem,
            xpEarned,
            achievementBonusXP,
            newAchievements: unlockedNow,
            notes: safeDecrypt(updatedProblem.notes || ""),
            solution: safeDecrypt(updatedProblem.solution || ""),
        }
    })
}
