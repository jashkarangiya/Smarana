import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const usernameSchema = z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at least 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            username: true,
            usernameChangedAt: true,
        },
    })

    if (!user) {
        return new NextResponse("User not found", { status: 404 })
    }

    const now = new Date()
    const lastChanged = user.usernameChangedAt ? new Date(user.usernameChangedAt) : null
    const daysSinceChange = lastChanged
        ? Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24))
        : null

    const canChange = !lastChanged || (daysSinceChange !== null && daysSinceChange >= 90)

    return NextResponse.json({
        username: user.username,
        canChange,
        daysUntilChange: lastChanged ? 90 - (daysSinceChange || 0) : 0,
        lastChangedAt: user.usernameChangedAt,
    })
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { username } = body

        // Validate format
        const result = usernameSchema.safeParse(username)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0].message },
                { status: 400 }
            )
        }

        const newUsername = result.data

        // Check if username is taken
        const existingUser = await prisma.user.findUnique({
            where: { usernameLower: newUsername.toLowerCase() },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Username is already taken" },
                { status: 409 }
            )
        }

        // Check cooldown
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { usernameChangedAt: true, usernameChangeCount: true },
        })

        if (!user) return new NextResponse("User not found", { status: 404 })

        const now = new Date()
        const lastChanged = user.usernameChangedAt ? new Date(user.usernameChangedAt) : null

        // Allow first change if count is 0, otherwise check 90 days.
        // Actually, user might have been created with a random username, so count might be 0.
        // If count > 0, enforce 90 days.
        // The implementation plan says "90-day cooldown logic".
        // Let's stick to: if changed recently, block.

        if (lastChanged) {
            const daysSinceChange = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24))
            if (daysSinceChange < 90) {
                return NextResponse.json(
                    { error: `You can change your username again in ${90 - daysSinceChange} days` },
                    { status: 403 }
                )
            }
        }

        // Update username
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                username: newUsername,
                usernameLower: newUsername.toLowerCase(),
                usernameChangedAt: now,
                usernameChangeCount: { increment: 1 },
            },
        })

        return NextResponse.json({
            username: updatedUser.username,
            message: "Username updated successfully",
        })
    } catch (error) {
        console.error("Failed to update username:", error)
        return NextResponse.json(
            { error: "Failed to update username" },
            { status: 500 }
        )
    }
}
