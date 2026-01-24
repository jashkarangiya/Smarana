import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

function validatePassword(password: string): { valid: boolean, error?: string } {
    if (password.length < 12) {
        return { valid: false, error: "Password must be at least 12 characters" }
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: "Password must contain an uppercase letter" }
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: "Password must contain a lowercase letter" }
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: "Password must contain a number" }
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return { valid: false, error: "Password must contain a special character" }
    }
    return { valid: true }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { currentPassword, newPassword } = await request.json()

        // Validate password strength
        const validation = validatePassword(newPassword)
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            )
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { passwordHash: true },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // If user has a password, verify current password
        if (user.passwordHash) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: "Current password is required" },
                    { status: 400 }
                )
            }
            const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
            if (!isValid) {
                return NextResponse.json(
                    { error: "Current password is incorrect" },
                    { status: 400 }
                )
            }
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                passwordHash: hashedPassword,
                passwordUpdatedAt: new Date(),
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Password update error:", error)
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { passwordHash: true },
        })

        return NextResponse.json({
            hasPassword: !!user?.passwordHash,
        })
    } catch (error) {
        console.error("Get password status error:", error)
        return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
    }
}
