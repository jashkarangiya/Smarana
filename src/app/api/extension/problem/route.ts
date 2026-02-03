import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateExtensionToken } from "@/lib/extension-auth"
import { safeDecrypt, safeEncrypt } from "@/lib/encryption"
import { z } from "zod"

const querySchema = z.object({
    platform: z.enum(["leetcode", "codeforces", "atcoder", "codechef"]),
    slug: z.string().min(1, "Slug is required"),
    url: z.string().optional(), // Optional URL for fallback matching
})

const saveSchema = z.object({
    platform: z.enum(["leetcode", "codeforces", "atcoder", "codechef"]),
    slug: z.string().min(1, "Slug is required"),
    notes: z.string().optional(),
    solution: z.string().optional(),
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
            url: searchParams.get("url") || undefined,
        }

        const validation = querySchema.safeParse(queryParams)

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { platform, slug, url } = validation.data

        // Fetch user preferences for solution visibility
        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            select: {
                showSolutionInExtension: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Find the problem by platform and slug (primary lookup)
        let problem = await prisma.revisionProblem.findUnique({
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
                url: true,
                notes: true,
                solution: true,
                nextReviewAt: true,
                reviewCount: true,
                interval: true,
                lastReviewedAt: true,
            },
        })

        // Fallback: try to find by URL if slug lookup failed
        if (!problem && url) {
            problem = await prisma.revisionProblem.findFirst({
                where: {
                    userId: auth.userId,
                    platform,
                    url: { contains: url },
                },
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    url: true,
                    notes: true,
                    solution: true,
                    nextReviewAt: true,
                    reviewCount: true,
                    interval: true,
                    lastReviewedAt: true,
                },
            })
        }

        // Not tracked in Smarana yet → return a clean empty shape
        if (!problem) {
            return NextResponse.json({
                tracked: false,
                platform,
                slug,
                title: null,
                difficulty: null,
                url: null,
                notes: "",
                solution: null,
                // Additional fields to match the shape if needed on frontend
                smaranaUrl: null,
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
            tracked: true,
            platform,
            slug,
            id: problem.id,
            title: problem.title,
            difficulty: problem.difficulty,
            url: problem.url,
            notes: decryptedNotes || "",
            solution: decryptedSolution,
            nextReviewAt: problem.nextReviewAt?.toISOString() || null,
            reviewCount: problem.reviewCount,
            interval: problem.interval,
            lastReviewedAt: problem.lastReviewedAt?.toISOString() || null,
            smaranaUrl,
        })
    } catch (error) {
        console.error("Extension problem fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch problem data" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/extension/problem
 *
 * Saves notes and/or solution for a problem from the extension.
 * Requires Bearer token authentication.
 */
export async function POST(request: Request) {
    try {
        // Validate extension token
        const auth = await validateExtensionToken(request)

        if (!auth) {
            return NextResponse.json(
                { error: "Unauthorized - Invalid or expired token" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validation = saveSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { platform, slug, notes, solution } = validation.data

        // Find the problem
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
            return NextResponse.json(
                { error: "Problem not found. Please add it to Smarana first." },
                { status: 404 }
            )
        }

        // Update notes and/or solution
        const updateData: { notes?: string; solution?: string } = {}

        if (notes !== undefined) {
            updateData.notes = safeEncrypt(notes) || ""
        }

        if (solution !== undefined) {
            updateData.solution = safeEncrypt(solution) || ""
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.revisionProblem.update({
                where: { id: problem.id },
                data: updateData,
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Extension problem save error:", error)
        return NextResponse.json(
            { error: "Failed to save problem data" },
            { status: 500 }
        )
    }
}
