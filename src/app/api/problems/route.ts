import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { startOfDay, endOfDay, addDays } from "date-fns"
import { safeDecrypt } from "@/lib/encryption"
import { problemCreateSchema } from "@/lib/validations/problem"
import { handleApiError } from "@/lib/api-error"
import { FilterGroupSchema } from "@/lib/schemas/filters"
import type { FilterGroup, FilterRule } from "@/types/filters"

const REVIEW_STATE_MATCHERS: Record<string, (now: Date) => any> = {
    PENDING: (now) => ({
        nextReviewAt: { lte: endOfDay(now) },
    }),
    OVERDUE: (now) => ({
        nextReviewAt: { lt: startOfDay(now) },
    }),
    DUE_TODAY: (now) => ({
        AND: [
            { nextReviewAt: { gte: startOfDay(now) } },
            { nextReviewAt: { lte: endOfDay(now) } },
        ],
    }),
    UPCOMING_7D: (now) => ({
        AND: [
            { nextReviewAt: { gt: endOfDay(now) } },
            { nextReviewAt: { lte: endOfDay(addDays(now, 7)) } },
        ],
    }),
    UPCOMING_30D: (now) => ({
        AND: [
            { nextReviewAt: { gt: endOfDay(now) } },
            { nextReviewAt: { lte: endOfDay(addDays(now, 30)) } },
        ],
    }),
    NEVER_REVIEWED: () => ({
        reviewCount: 0,
    }),
}

function parseDateValue(value: any) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date
}

function buildRuleWhere(rule: FilterRule, now: Date) {
    const value = rule.value

    switch (rule.field) {
        case "reviewState": {
            if (typeof value !== "string") return null
            const matcher = REVIEW_STATE_MATCHERS[value]
            if (!matcher) return null
            const clause = matcher(now)
            if (rule.op === "is_not") return { NOT: clause }
            return clause
        }
        case "difficulty": {
            if (!value) return null
            if (rule.op === "is") return { difficulty: { equals: value, mode: "insensitive" } }
            if (rule.op === "is_not") return { NOT: { difficulty: { equals: value, mode: "insensitive" } } }
            return null
        }
        case "platform": {
            if (!value) return null
            if (rule.op === "is") return { platform: { equals: value, mode: "insensitive" } }
            if (rule.op === "is_not") return { NOT: { platform: { equals: value, mode: "insensitive" } } }
            return null
        }
        case "title": {
            if (!value) return null
            if (rule.op === "is") return { title: { equals: value, mode: "insensitive" } }
            if (rule.op === "contains") return { title: { contains: value, mode: "insensitive" } }
            if (rule.op === "not_contains") return { NOT: { title: { contains: value, mode: "insensitive" } } }
            return null
        }
        case "nextReviewAt":
        case "firstSolvedAt": {
            const dateValue = parseDateValue(value)
            if (!dateValue) return null
            const field = rule.field
            if (rule.op === "before") return { [field]: { lt: startOfDay(dateValue) } }
            if (rule.op === "after") return { [field]: { gt: endOfDay(dateValue) } }
            if (rule.op === "between") {
                const [startRaw, endRaw] = Array.isArray(value) ? value : String(value).split(",")
                const startDate = parseDateValue(startRaw)
                const endDate = parseDateValue(endRaw)
                if (!startDate || !endDate) return null
                return {
                    AND: [
                        { [field]: { gte: startOfDay(startDate) } },
                        { [field]: { lte: endOfDay(endDate) } },
                    ],
                }
            }
            return null
        }
        case "reviewCount": {
            const num = Number(value)
            if (!Number.isFinite(num)) return null
            if (rule.op === "gte") return { reviewCount: { gte: num } }
            if (rule.op === "lte") return { reviewCount: { lte: num } }
            if (rule.op === "is") return { reviewCount: num }
            return null
        }
        default:
            return null
    }
}

function buildAdvancedWhere(group: FilterGroup, now: Date) {
    const clauses = group.rules
        .map((rule) => buildRuleWhere(rule, now))
        .filter(Boolean) as any[]

    if (clauses.length === 0) return null
    return group.join === "or" ? { OR: clauses } : { AND: clauses }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined
    const filter = searchParams.get("filter") // 'today', 'due', 'upcoming'
    const rawFilters = searchParams.get("filters")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return new NextResponse("User not found", { status: 404 })
    }

    const whereClause: any = { userId: user.id }
    const now = new Date()

    if (filter === "solved-today") {
        whereClause.lastSolvedAt = {
            gte: startOfDay(now),
            lte: endOfDay(now),
        }
    } else if (filter === "due") {
        whereClause.nextReviewAt = {
            lte: endOfDay(now),
        }
    } else if (filter === "upcoming") {
        whereClause.nextReviewAt = {
            gt: endOfDay(now),
        }
    }

    if (rawFilters) {
        try {
            const decoded = Buffer.from(rawFilters, "base64").toString("utf-8")
            const parsed = JSON.parse(decoded)
            const validation = FilterGroupSchema.safeParse(parsed)

            if (validation.success && validation.data.rules.length > 0) {
                const advanced = buildAdvancedWhere(validation.data, now)
                if (advanced) {
                    whereClause.AND = [...(whereClause.AND || []), advanced]
                }
            }
        } catch (e) {
            console.warn("Invalid filters param, ignoring")
        }
    }

    const problems = await prisma.revisionProblem.findMany({
        where: whereClause,
        orderBy: { nextReviewAt: "asc" },
        take: limit,
    })

    // Decrypt sensitive fields for each problem
    const decryptedProblems = problems.map(problem => ({
        ...problem,
        notes: safeDecrypt(problem.notes),
        solution: safeDecrypt(problem.solution),
    }))

    return NextResponse.json(decryptedProblems)
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()

        // Validate with Zod
        const validation = problemCreateSchema.safeParse(body)
        if (!validation.success) {
            const errorMsg = validation.error.issues[0].message
            return NextResponse.json({ error: errorMsg }, { status: 400 })
        }

        const { title, url, difficulty, platform = "leetcode" } = validation.data

        // Extract slug from URL if possible, otherwise use timestamp
        let problemSlug = `manual-${Date.now()}`
        if (url.includes("/problems/")) {
            problemSlug = url.split("/problems/")[1].split("/")[0]
        }

        // Create the problem
        const problem = await prisma.revisionProblem.create({
            data: {
                userId: session.user.id,
                title,
                url,
                difficulty,
                platform,
                problemSlug,
                firstSolvedAt: new Date(),
                lastSolvedAt: new Date(),
                nextReviewAt: new Date(), // Due immediately
                interval: 0,
                reviewCount: 0,
            }
        })

        return NextResponse.json(problem)
    } catch (error) {
        return handleApiError(error)
    }
}
