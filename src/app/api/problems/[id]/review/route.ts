import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getNextReviewDate } from "@/lib/repetition"
import { safeDecrypt } from "@/lib/encryption"
import { handleApiError } from "@/lib/api-error"
import { calculateReviewXP } from "@/lib/xp"
import { ACHIEVEMENTS, AchievementContext } from "@/lib/achievements"

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rating } = await req.json().catch(() => ({ rating: 3 }))

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stats: true } // Need stats for context
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const problem = await prisma.revisionProblem.findUnique({
        where: { id: params.id },
    })

    if (!problem || problem.userId !== user.id) {
        return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    const now = new Date()
    const todayKey = now.toISOString().split('T')[0]

    // Check if this is the first review of the day
    const existingLog = await prisma.reviewLog.findUnique({
        where: { userId_day: { userId: user.id, day: todayKey } }
    })
    const isFirstOfDay = !existingLog

    // 1. Calculate XP
    const xpEarned = calculateReviewXP(problem.difficulty, Number(rating), isFirstOfDay)

    // 2. Queue Repetition Logic
    const newReviewCount = problem.reviewCount + 1
    const nextDate = getNextReviewDate(newReviewCount, now)
    const newInterval = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    try {
        const result = await prisma.$transaction(async (tx) => {
            // A. Update Problem
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

            // B. Log Event
            await tx.reviewEvent.create({
                data: {
                    userId: user.id,
                    problemId: problem.id,
                    rating: Number(rating) || 3,
                    interval: newInterval,
                    xpEarned: xpEarned,
                    reviewedAt: now,
                }
            })

            // C. Update/Create Daily Log
            await tx.reviewLog.upsert({
                where: { userId_day: { userId: user.id, day: todayKey } },
                create: { userId: user.id, day: todayKey, count: 1, xpEarned },
                update: { count: { increment: 1 }, xpEarned: { increment: xpEarned } }
            })

            // D. Update User Stats & Check Achievements
            // Fetch fresh stats or use loaded (reload recommended inside tx for strictness if high concurrency, but usually fine)
            // We need aggregate counts for achievements
            // Ideally we maintain counters on UserStats to avoid counting *everything* every time.

            // Increment counters first
            const stats = await tx.userStats.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    totalReviews: 1,
                    lastReviewedAt: now,
                    currentStreak: 1,
                    longestStreak: 1,
                    reviewsThisWeek: 1
                },
                update: {
                    totalReviews: { increment: 1 },
                    lastReviewedAt: now,
                    reviewsThisWeek: { increment: 1 }
                }
            })

            // Streak Logic (Lightweight)
            // If last review was yesterday (UTC), increment streak. If today, no change. Else reset.
            // Using `existingLog` check combined with `stats.lastReviewedAt` 
            // `existingLog` tells us if we already reviewed TODAY.
            let currentStreak = stats.currentStreak
            if (!existingLog) {
                // First review of today. Check if we reviewed yesterday.
                const yesterday = new Date(now)
                yesterday.setDate(yesterday.getDate() - 1)
                const yesterdayKey = yesterday.toISOString().split('T')[0]

                const yesterdayLog = await tx.reviewLog.findUnique({
                    where: { userId_day: { userId: user.id, day: yesterdayKey } }
                })

                if (yesterdayLog) {
                    currentStreak += 1
                } else {
                    currentStreak = 1 // Reset if missed yesterday
                }

                // Update streak in DB
                await tx.userStats.update({
                    where: { userId: user.id },
                    data: {
                        currentStreak,
                        longestStreak: Math.max(stats.longestStreak, currentStreak)
                    }
                })
            }

            // E. Achievement Context
            // We need a few counts. 
            // OPTIMIZATION: In a real app, we'd carry these in UserStats. 
            // For now, fast counts are acceptable.
            const problemsTracked = await tx.revisionProblem.count({ where: { userId: user.id } })
            const friendsCount = await tx.friendship.count({ where: { userId: user.id } })

            const ctx: AchievementContext = {
                totalReviews: stats.totalReviews + 1, // +1 because we effectively just did one
                currentStreak: !existingLog && currentStreak === stats.currentStreak ? currentStreak : (existingLog ? stats.currentStreak : 1), // Handle the fact we just updated or not
                longestStreak: Math.max(stats.longestStreak, currentStreak),
                problemsTracked,
                friendsCount,
            }

            // Check for new unlocks
            const unlockedNow: string[] = []
            let achievementBonusXP = 0
            const currentlyUnlocked = new Set(stats.unlockedAchievements)

            for (const ach of ACHIEVEMENTS) {
                if (!currentlyUnlocked.has(ach.id)) {
                    if (ach.isUnlocked(ctx)) {
                        unlockedNow.push(ach.id)
                        achievementBonusXP += ach.xpReward
                    }
                }
            }

            // F. Final User Update (Base XP + Achievement XP)
            const totalXpGain = xpEarned + achievementBonusXP
            await tx.user.update({
                where: { id: user.id },
                data: { xp: { increment: totalXpGain } }
            })

            if (unlockedNow.length > 0) {
                await tx.userStats.update({
                    where: { userId: user.id },
                    data: {
                        unlockedAchievements: { push: unlockedNow }
                    }
                })
            }

            return { updatedProblem, xpEarned, achievementBonusXP, unlockedAchievements: unlockedNow }
        })

        return NextResponse.json({
            problem: result.updatedProblem,
            xpEarned: result.xpEarned,
            achievementBonusXP: result.achievementBonusXP,
            newAchievements: result.unlockedAchievements, // Frontend can show toasts
            notes: safeDecrypt(result.updatedProblem.notes || ""),
            solution: safeDecrypt(result.updatedProblem.solution || ""),
        })

    } catch (error) {
        return handleApiError(error)
    }
}

