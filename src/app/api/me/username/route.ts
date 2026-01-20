import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { username } = await request.json()

        if (!username || typeof username !== "string") {
            return NextResponse.json({ error: "Username is required" }, { status: 400 })
        }

        // Validate username format: 3-20 chars, alphanumeric + underscores
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
        if (!usernameRegex.test(username)) {
            return NextResponse.json(
                { error: "Username must be 3-20 characters, alphanumeric and underscores only" },
                { status: 400 }
            )
        }

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
        console.error("Username update error:", error)
        return NextResponse.json({ error: "Failed to update username" }, { status: 500 })
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
        console.error("Get username error:", error)
        return NextResponse.json({ error: "Failed to get username" }, { status: 500 })
    }
}
