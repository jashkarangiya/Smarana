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
    source: "web" | "extension" | "daily_challenge"
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
        notes: safeDecrypt(problem.notes || "") || "",
        solution: safeDecrypt(problem.solution || "") || "",
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
        // 1. Check for existing XpEvent for this problem/day (idempotency)
        // We use a specific kind for reviews to separate them from other XP events if needed
        const existingReviewParams = {
            userId: input.userId,
            problemId: input.problemId,
            dateKey: todayKey,
            kind: "review"
        }

        const existingEvent = await tx.xpEvent.findFirst({
            where: existingReviewParams
        })

        // Also check if this was a daily challenge attempt
        let isDailyChallenge = input.source === "extension" ? false : input.source === "daily_challenge" // "daily_challenge" passed from frontend
            || (input.source as string) === "daily_challenge"

        // If input.source is just "web" or "extension", we might need another way to know if it's a daily challenge
        // But per plan, we will pass "daily_challenge" as source from frontend.

        const problem = await tx.revisionProblem.findUnique({
            where: { id: input.problemId },
        })

        if (!problem || problem.userId !== input.userId) {
            throw new Error("Problem not found")
        }

        // 2. Calculate XP
        // Base XP based on difficulty
        const baseXp = calculateReviewXP(problem.difficulty, Number(input.rating), !!existingEvent) // 0 if existing event? calculateReviewXP logic usually handles "first of day" but here we want explicit control

        // If verified existing review today, base XP is 0
        const actualBaseXp = existingEvent ? 0 : baseXp

        // Bonus XP for daily challenge (if not already awarded)
        let bonusXp = 0
        let challengeCompleted = false

        if (input.source === "daily_challenge") {
            const existingChallengeEvent = await tx.xpEvent.findFirst({
                where: {
                    userId: input.userId,
                    problemId: input.problemId,
                    dateKey: todayKey,
                    kind: "daily_challenge"
                }
            })

            if (!existingChallengeEvent) {
                // Award bonus
                bonusXp = problem.difficulty === "EASY" ? 20 : problem.difficulty === "MEDIUM" ? 50 : 100
                challengeCompleted = true

                // Record challenge event
                await tx.xpEvent.create({
                    data: {
                        userId: input.userId,
                        problemId: input.problemId,
                        kind: "daily_challenge",
                        amount: bonusXp,
                        dateKey: todayKey,
                        createdAt: now
                    }
                })
            }
        }

        // Record review event (if not exists) - strictly for XP tracking
        // We still record the ReviewEvent for stats/logs below, but XpEvent is for the ledger
        if (!existingEvent && actualBaseXp > 0) {
            await tx.xpEvent.create({
                data: {
                    ...existingReviewParams,
                    amount: actualBaseXp,
                    createdAt: now
                }
            })
        }

        const xpEarned = actualBaseXp + bonusXp

        // 3. Update Problem Scheduling (Always update schedule even if reviewed today? 
        // Usually we only want to update schedule once per day to avoid spacing it out too much on spam.
        // But for now let's allow re-rating if they forgot -> remembered.)

        // Actually, if they already reviewed it today, maybe we shouldn't push the date further?
        // Let's stick to: Update logic is same, but XP is gated.

        const newReviewCount = problem.reviewCount + 1
        // ... (standard scheduling logic)
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

        // 4. Log the review event (Historical log, not for XP ledger)
        await tx.reviewEvent.create({
            data: {
                userId: input.userId,
                problemId: problem.id,
                rating: Number(input.rating) || 3,
                source: input.source,
                timeSpentMs: input.timeSpentMs,
                clientEventId: input.clientEventId,
                interval: newInterval,
                xpEarned, // Total earned this time
                reviewedAt: now,
                dateKey: todayKey,
                timezone: timeZone,
            },
        })

        // 5. Update User XP
        if (xpEarned > 0) {
            await tx.user.update({
                where: { id: input.userId },
                data: { xp: { increment: xpEarned } },
            })
        }

        // 6. Stats & Streaks
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

        // 7. Achievements
        const problemsTracked = await tx.revisionProblem.count({ where: { userId: input.userId } })
        const friendsCount = await tx.friendship.count({ where: { userId: input.userId } })

        const ctx: AchievementContext = {
            totalReviews: stats.totalReviews, // updated above
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

                // Log achievement XP event
                await tx.xpEvent.create({
                    data: {
                        userId: input.userId,
                        kind: "achievement",
                        amount: ach.xpReward,
                        dateKey: todayKey,
                        problemId: ach.id // store achievement ID here? or keep null. Let's keep null or use a separate field. user XpEvent schema has problemId. 
                        // For now let's just create it and maybe abuse problemId or just leave it null.
                        // Better to leave problemId null.
                    }
                })
            }
        }

        if (achievementBonusXP > 0) {
            await tx.user.update({
                where: { id: input.userId },
                data: { xp: { increment: achievementBonusXP } },
            })
            await tx.userStats.update({
                where: { userId: input.userId },
                data: {
                    unlockedAchievements: { push: unlockedNow },
                },
            })
        }

        return {
            problem: updatedProblem,
            xpEarned: xpEarned + achievementBonusXP, // Return total
            achievementBonusXP,
            newAchievements: unlockedNow,
            notes: safeDecrypt(updatedProblem.notes || "") || "",
            solution: safeDecrypt(updatedProblem.solution || "") || "",
        }
    })
}
