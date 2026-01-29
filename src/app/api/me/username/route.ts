import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { usernameSchema } from "@/lib/validations/user"
import { handleApiError } from "@/lib/api-error"

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()

        const validation = usernameSchema.safeParse(body)
        if (!validation.success) {
            const errorMsg = validation.error.issues[0].message
            return NextResponse.json({ error: errorMsg }, { status: 400 })
        }

        const { username } = validation.data

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true, usernameChangedAt: true },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Check 90-day cooldown
        if (user.usernameChangedAt) {
            const daysSinceChange = Math.floor(
                (Date.now() - user.usernameChangedAt.getTime()) / (1000 * 60 * 60 * 24)
            )
            if (daysSinceChange < 90) {
                const daysRemaining = 90 - daysSinceChange
                return NextResponse.json(
                    { error: `You can change your username in ${daysRemaining} days` },
                    { status: 400 }
                )
            }
        }

        // Check if username is taken
        const existingUser = await prisma.user.findUnique({
            where: { username: username.toLowerCase() },
        })

        if (existingUser && existingUser.id !== session.user.id) {
            return NextResponse.json(
                { error: "Username is already taken" },
                { status: 400 }
            )
        }

        // Update username
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                username: username.toLowerCase(),
                usernameChangedAt: new Date(),
            },
        })

        return NextResponse.json({
            success: true,
            username: updatedUser.username,
        })
    } catch (error) {
        return handleApiError(error)
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const checkUsername = searchParams.get("check")

        if (checkUsername) {
            const existingUser = await prisma.user.findUnique({
                where: { username: checkUsername.toLowerCase() },
            })
            return NextResponse.json({ available: !existingUser })
        }

        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                username: true,
                usernameChangedAt: true,
                leetcodeUsername: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        let daysUntilChange = 0
        if (user.usernameChangedAt) {
            const daysSinceChange = Math.floor(
                (Date.now() - user.usernameChangedAt.getTime()) / (1000 * 60 * 60 * 24)
            )
            daysUntilChange = Math.max(0, 90 - daysSinceChange)
        }

        return NextResponse.json({
            username: user.username || user.leetcodeUsername,
            canChange: daysUntilChange === 0,
            daysUntilChange,
        })
    } catch (error) {
        return handleApiError(error)
    }
}
