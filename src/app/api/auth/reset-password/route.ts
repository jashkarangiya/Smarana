import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { validatePassword } from "@/lib/auth/passwordPolicy"


export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validate password strength
        const { ok, failed } = validatePassword(password)
        if (!ok) {
            return NextResponse.json(
                { error: `Password does not meet requirements: ${failed.map(f => f.label).join(", ")}` },
                { status: 400 }
            )
        }

        // Hash the token to find it
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

        // Find the reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        })

        if (!resetToken) {
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
            )
        }

        // Check if already used
        if (resetToken.usedAt) {
            return NextResponse.json(
                { error: "Reset token has already been used" },
                { status: 400 }
            )
        }

        // Check if expired
        if (resetToken.expiresAt < new Date()) {
            return NextResponse.json(
                { error: "Reset token has expired" },
                { status: 400 }
            )
        }

        // Hash the new password
        const passwordHash = await bcrypt.hash(password, 12)

        // Update user password and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: {
                    passwordHash,
                    passwordUpdatedAt: new Date(),
                },
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() },
            }),
            // Invalidate all sessions for this user (force re-login everywhere)
            prisma.session.deleteMany({
                where: { userId: resetToken.userId },
            }),
        ])

        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
        })
    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { error: "Failed to reset password" },
            { status: 500 }
        )
    }
}
