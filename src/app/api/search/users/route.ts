import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get("q")?.trim() || ""

        // Require minimum 2 characters to prevent scraping
        if (query.length < 2) {
            return NextResponse.json([])
        }

        const queryLower = query.toLowerCase()

        // Only return users with public profiles
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { usernameLower: { startsWith: queryLower } },
                            { name: { contains: query } },
                        ],
                    },
                    { profileVisibility: "PUBLIC" },
                    { username: { not: null } },
                ],
            },
            select: {
                username: true,
                name: true,
                image: true,
            },
            take: 8,
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("Search users error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
