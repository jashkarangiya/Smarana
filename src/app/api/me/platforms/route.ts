import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { PLATFORMS } from "@/lib/platforms"

const VALID_PLATFORMS = ["leetcode", "codeforces", "codechef", "atcoder"]

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        const body = await req.json()
        const { platform, username } = body

        if (!platform || !VALID_PLATFORMS.includes(platform)) {
            return new NextResponse("Invalid platform", { status: 400 })
        }

        // Build the update data dynamically
        const updateData: Record<string, string | null> = {}

        if (platform === "leetcode") {
            updateData.leetcodeUsername = username || null
        } else if (platform === "codeforces") {
            updateData.codeforcesUsername = username || null
        } else if (platform === "codechef") {
            updateData.codechefUsername = username || null
        } else if (platform === "atcoder") {
            updateData.atcoderUsername = username || null
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData,
        })

        return NextResponse.json({
            success: true,
            platform,
            username: username || null,
        })
    } catch (error) {
        console.error("PUT /api/me/platforms error:", error)
        return new NextResponse("Internal server error", { status: 500 })
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Fetch full user to avoid Prisma select type issues
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Build response with platform info
        const getUsernameForPlatform = (id: string): string | null => {
            switch (id) {
                case "leetcode": return user.leetcodeUsername ?? null
                case "codeforces": return user.codeforcesUsername ?? null
                case "codechef": return user.codechefUsername ?? null
                case "atcoder": return user.atcoderUsername ?? null
                default: return null
            }
        }

        const platforms = Object.entries(PLATFORMS).map(([id, info]) => {
            const username = getUsernameForPlatform(id)
            return {
                id,
                name: info.name,
                icon: info.icon,
                color: info.color,
                available: info.available,
                username,
                connected: !!username,
            }
        })

        return NextResponse.json(platforms)
    } catch (error) {
        console.error("GET /api/me/platforms error:", error)
        return new NextResponse("Internal server error", { status: 500 })
    }
}
