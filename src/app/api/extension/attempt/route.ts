import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateExtensionToken } from "@/lib/extension-auth"
import { z } from "zod"
import { buildPerformanceNudge } from "@/lib/performance-nudge"

const attemptSchema = z.object({
    platform: z.string().min(1),
    platformKey: z.string().min(1),
    startedAt: z.string().min(1),
    endedAt: z.string().min(1),
    durationSec: z.number().finite(),
})

export async function POST(request: Request) {
    try {
        const auth = await validateExtensionToken(request)
        if (!auth) {
            return withCors(NextResponse.json(
                { error: "Unauthorized - Invalid or expired token" },
                { status: 401 }
            ))
        }

        const body = await request.json()
        const validation = attemptSchema.safeParse(body)
        if (!validation.success) {
            return withCors(NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            ))
        }

        const { platform, platformKey, startedAt, endedAt, durationSec } = validation.data

        const startDate = new Date(startedAt)
        const endDate = new Date(endedAt)
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return withCors(NextResponse.json({ error: "Invalid timestamps" }, { status: 400 }))
        }

        const duration = Math.max(0, Math.floor(durationSec))

        const problem = await prisma.revisionProblem.findUnique({
            where: {
                userId_platform_problemSlug: {
                    userId: auth.userId,
                    platform,
                    problemSlug: platformKey,
                },
            },
            select: {
                id: true,
                attemptCount: true,
                attemptTotalSec: true,
                lastAttemptSec: true,
                bestAttemptSec: true,
            },
        })

        if (!problem) {
            return withCors(NextResponse.json({ error: "Problem not found for user" }, { status: 404 }))
        }

        const prevLast = problem.lastAttemptSec ?? null
        const prevBest = problem.bestAttemptSec ?? null
        const newBest = prevBest == null ? duration : Math.min(prevBest, duration)

        await prisma.$transaction([
            prisma.problemAttempt.create({
                data: {
                    userId: auth.userId,
                    problemId: problem.id,
                    platform,
                    platformKey,
                    startedAt: startDate,
                    endedAt: endDate,
                    durationSec: duration,
                    source: "EXTENSION",
                },
            }),
            prisma.revisionProblem.update({
                where: { id: problem.id },
                data: {
                    attemptCount: { increment: 1 },
                    attemptTotalSec: { increment: duration },
                    lastAttemptSec: duration,
                    bestAttemptSec: newBest,
                },
            }),
        ])

        const nudge = buildPerformanceNudge({
            currentSec: duration,
            prevLastSec: prevLast,
            prevBestSec: prevBest,
        })

        return withCors(NextResponse.json({ ok: true, nudge }))
    } catch (error) {
        console.error("Extension attempt save error:", error)
        return withCors(NextResponse.json({ error: "Failed to save attempt" }, { status: 500 }))
    }
}

export async function OPTIONS() {
    return withCors(new NextResponse(null, { status: 204 }))
}

function withCors(response: NextResponse) {
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response
}
