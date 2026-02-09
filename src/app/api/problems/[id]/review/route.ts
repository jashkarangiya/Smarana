import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-error"
import { completeReview } from "@/lib/reviews/complete-review"
import { z } from "zod"

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const BodySchema = z.object({
        rating: z.number().int().min(1).max(5).default(3),
        source: z.enum(["web", "extension"]).default("web"),
        timeSpentMs: z.number().int().min(0).max(6 * 60 * 60 * 1000).optional(),
        clientEventId: z.string().min(8).max(100).optional(),
    })
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: "Bad request" }, { status: 400 })
    }

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

    try {
        const result = await completeReview({
            userId: user.id,
            problemId: problem.id,
            rating: parsed.data.rating,
            source: parsed.data.source,
            timeSpentMs: parsed.data.timeSpentMs,
            clientEventId: parsed.data.clientEventId,
            timeZone: user.timezone || "UTC",
        })

        return NextResponse.json(result)
    } catch (error) {
        return handleApiError(error)
    }
}

