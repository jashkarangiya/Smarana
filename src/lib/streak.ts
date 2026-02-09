import type { Prisma, PrismaClient } from "@prisma/client"

type PrismaTx = PrismaClient | Prisma.TransactionClient

export function dateKeyInTz(date: Date, timeZone: string) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date)
}

export function prevDateKey(dateKey: string) {
    const [year, month, day] = dateKey.split("-").map(Number)
    const utc = new Date(Date.UTC(year, month - 1, day))
    utc.setUTCDate(utc.getUTCDate() - 1)
    return utc.toISOString().slice(0, 10)
}

export function getEffectiveStreak(opts: {
    streakCurrent: number
    streakLastDate: string | null
    now: Date
    timeZone: string
}) {
    const { streakCurrent, streakLastDate, now, timeZone } = opts
    if (!streakLastDate) return 0
    const todayKey = dateKeyInTz(now, timeZone)
    if (streakLastDate === todayKey) return streakCurrent
    const yesterdayKey = prevDateKey(todayKey)
    if (streakLastDate === yesterdayKey) return streakCurrent
    return 0
}

export async function recordReviewForStreak(tx: PrismaTx, opts: {
    userId: string
    timeZone: string
    now: Date
}) {
    const { userId, timeZone, now } = opts
    const todayKey = dateKeyInTz(now, timeZone)

    await tx.dailyReviewStat.upsert({
        where: { userId_dateKey: { userId, dateKey: todayKey } },
        update: { reviewCount: { increment: 1 }, timezone: timeZone },
        create: { userId, dateKey: todayKey, timezone: timeZone, reviewCount: 1 },
    })

    const user = await tx.user.findUnique({
        where: { id: userId },
        select: { streakCurrent: true, streakLongest: true, streakLastDate: true },
    })

    if (!user) {
        return { todayKey, streakCurrent: 0, streakLongest: 0 }
    }

    if (user.streakLastDate === todayKey) {
        return { todayKey, streakCurrent: user.streakCurrent, streakLongest: user.streakLongest }
    }

    const yesterdayKey = prevDateKey(todayKey)
    const nextStreak = user.streakLastDate === yesterdayKey ? user.streakCurrent + 1 : 1
    const nextLongest = Math.max(user.streakLongest, nextStreak)

    await tx.user.update({
        where: { id: userId },
        data: {
            streakCurrent: nextStreak,
            streakLongest: nextLongest,
            streakLastDate: todayKey,
        },
    })

    return { todayKey, streakCurrent: nextStreak, streakLongest: nextLongest }
}

export async function recomputeStreak(prisma: PrismaClient, opts: {
    userId: string
    timeZone: string
}) {
    const { userId, timeZone } = opts
    const days = await prisma.dailyReviewStat.findMany({
        where: { userId, reviewCount: { gt: 0 } },
        orderBy: { dateKey: "desc" },
        select: { dateKey: true },
        take: 400,
    })

    const now = new Date()
    const todayKey = dateKeyInTz(now, timeZone)
    const yesterdayKey = prevDateKey(todayKey)

    const set = new Set(days.map((d) => d.dateKey))
    let startKey: string | null = null
    if (set.has(todayKey)) startKey = todayKey
    else if (set.has(yesterdayKey)) startKey = yesterdayKey

    if (!startKey) {
        await prisma.user.update({
            where: { id: userId },
            data: { streakCurrent: 0, streakLastDate: null },
        })
        return
    }

    let streak = 0
    let cursor = startKey
    while (set.has(cursor)) {
        streak += 1
        cursor = prevDateKey(cursor)
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streakLongest: true },
    })

    await prisma.user.update({
        where: { id: userId },
        data: {
            streakCurrent: streak,
            streakLastDate: startKey,
            streakLongest: Math.max(user?.streakLongest ?? 0, streak),
        },
    })
}
