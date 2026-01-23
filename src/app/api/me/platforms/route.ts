import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { PLATFORMS } from "@/lib/platforms"

const VALID_PLATFORMS = ["leetcode", "codeforces", "codechef", "atcoder"]

export async function PUT(req: Request) {
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

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
    })

    return NextResponse.json({
        success: true,
        platform,
        username: username || null,
    })
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            leetcodeUsername: true,
            codeforcesUsername: true,
            codechefUsername: true,
            atcoderUsername: true,
        },
    })

    if (!user) {
        return new NextResponse("User not found", { status: 404 })
    }

    // Build response with platform info
    const platforms = Object.entries(PLATFORMS).map(([id, info]) => ({
        id,
        name: info.name,
        icon: info.icon,
        color: info.color,
        available: info.available,
        username: id === "leetcode" ? user.leetcodeUsername :
            id === "codeforces" ? user.codeforcesUsername :
                id === "codechef" ? user.codechefUsername :
                    id === "atcoder" ? user.atcoderUsername :
                        null,
        connected: (id === "leetcode" && !!user.leetcodeUsername) ||
            (id === "codeforces" && !!user.codeforcesUsername) ||
            (id === "codechef" && !!user.codechefUsername) ||
            (id === "atcoder" && !!user.atcoderUsername),
    }))

    return NextResponse.json(platforms)
}
