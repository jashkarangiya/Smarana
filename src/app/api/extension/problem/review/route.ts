import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateExtensionToken } from "@/lib/extension-auth"
import { completeReview } from "@/lib/reviews/complete-review"
import { z } from "zod"

const reviewSchema = z.object({
    platform: z.enum(["leetcode", "codeforces", "atcoder", "codechef"]),
    slug: z.string().min(1, "Slug is required"),
    rating: z.number().int().min(1).max(5).optional(),
    timeSpentMs: z.number().int().min(0).max(6 * 60 * 60 * 1000).optional(),
    clientEventId: z.string().min(8).max(100).optional(),
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
        const validation = reviewSchema.safeParse(body)
        if (!validation.success) {
            return withCors(NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            ))
        }

        const { platform, slug, rating, timeSpentMs, clientEventId } = validation.data

        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            include: { stats: true },
        })

        if (!user) {
            return withCors(NextResponse.json({ error: "User not found" }, { status: 404 }))
        }

        const problem = await prisma.revisionProblem.findUnique({
            where: {
                userId_platform_problemSlug: {
                    userId: auth.userId,
                    platform,
                    problemSlug: slug,
                },
            },
        })

        if (!problem) {
            return withCors(NextResponse.json({ error: "Problem not found" }, { status: 404 }))
        }

        const result = await completeReview({
            userId: user.id,
            problemId: problem.id,
            rating: rating || 3,
            source: "extension",
            timeSpentMs,
            clientEventId,
            timeZone: user.timezone || "UTC",
        })

        return withCors(NextResponse.json(result))
    } catch (error) {
        console.error("Extension review error:", error)
        return withCors(NextResponse.json({ error: "Failed to review problem" }, { status: 500 }))
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
