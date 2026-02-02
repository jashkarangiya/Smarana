import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateExtensionToken } from "@/lib/extension-auth"
import { safeDecrypt } from "@/lib/encryption"
import { z } from "zod"

const querySchema = z.object({
    platform: z.enum(["leetcode", "codeforces", "atcoder", "codechef"]),
    slug: z.string().min(1, "Slug is required"),
})

/**
 * GET /api/extension/problem?platform=leetcode&slug=two-sum
 *
 * Fetches problem data for the extension overlay.
 * Requires Bearer token authentication.
 */
export async function GET(request: Request) {
    try {
        // Validate extension token
        const auth = await validateExtensionToken(request)

        if (!auth) {
            return NextResponse.json(
                { error: "Unauthorized - Invalid or expired token" },
                { status: 401 }
            )
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url)
        const queryParams = {
            platform: searchParams.get("platform"),
            slug: searchParams.get("slug"),
        }

        const validation = querySchema.safeParse(queryParams)

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { platform, slug } = validation.data

        // Fetch user preferences for solution visibility
        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            select: {
                showSolutionInExtension: true,
                username: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Find the problem by platform and slug
        const problem = await prisma.revisionProblem.findUnique({
            where: {
                userId_platform_problemSlug: {
                    userId: auth.userId,
                    platform,
                    problemSlug: slug,
                },
            },
            select: {
                id: true,
                title: true,
                difficulty: true,
                platform: true,
                problemSlug: true,
                url: true,
                notes: true,
                solution: true,
                nextReviewAt: true,
                reviewCount: true,
                interval: true,
                lastReviewedAt: true,
            },
        })

        if (!problem) {
            return NextResponse.json({
                found: false,
                problem: null,
            })
        }

        // Decrypt notes and conditionally decrypt solution
        const decryptedNotes = safeDecrypt(problem.notes)
        const decryptedSolution = user.showSolutionInExtension
            ? safeDecrypt(problem.solution)
            : null

        // Build the Smarana app URL for this problem
        const smaranaUrl = `${process.env.NEXTAUTH_URL || "https://smarana.app"}/problems/${problem.id}`

        return NextResponse.json({
            found: true,
            problem: {
                id: problem.id,
                title: problem.title,
                difficulty: problem.difficulty,
                platform: problem.platform,
                slug: problem.problemSlug,
                notes: decryptedNotes || "",
                solution: decryptedSolution,
                nextReviewAt: problem.nextReviewAt?.toISOString() || null,
                reviewCount: problem.reviewCount,
                interval: problem.interval,
                lastReviewedAt: problem.lastReviewedAt?.toISOString() || null,
                smaranaUrl,
            },
        })
    } catch (error) {
        console.error("Extension problem fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch problem data" },
            { status: 500 }
        )
    }
}
