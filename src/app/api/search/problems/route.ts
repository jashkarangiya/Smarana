import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const query = searchParams.get("q")?.trim() || ""

        // Require minimum 2 characters
        if (query.length < 2) {
            return NextResponse.json([])
        }

        const problems = await prisma.revisionProblem.findMany({
            where: {
                userId: session.user.id,
                OR: [
                    { title: { contains: query } },
                    { problemSlug: { contains: query.toLowerCase() } },
                ],
            },
            select: {
                id: true,
                title: true,
                difficulty: true,
                platform: true,
                problemSlug: true,
            },
            take: 8,
            orderBy: { updatedAt: "desc" },
        })

        return NextResponse.json(problems)
    } catch (error) {
        console.error("Search problems error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
