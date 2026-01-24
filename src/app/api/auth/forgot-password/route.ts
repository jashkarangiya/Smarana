import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Rate limiting helper (simple in-memory - use Redis in production)
const resetAttempts = new Map<string, { count: number, resetAt: number }>()

function checkRateLimit(email: string): boolean {
    const now = Date.now()
    const limit = resetAttempts.get(email)

    if (!limit || now > limit.resetAt) {
        resetAttempts.set(email, { count: 1, resetAt: now + 60 * 60 * 1000 }) // 1 hour window
        return true
    }

    if (limit.count >= 3) {
        return false // Max 3 attempts per hour
    }

    limit.count++
    return true
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            // Always return success to prevent enumeration
            return NextResponse.json({ success: true })
        }

        // Check rate limit
        if (!checkRateLimit(email)) {
            // Still return success to prevent enumeration
            return NextResponse.json({ success: true })
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        // Always return success, even if user not found (prevents email enumeration)
        if (!user) {
            return NextResponse.json({ success: true })
        }

        // Generate random token (32 bytes = 64 hex chars)
        const token = crypto.randomBytes(32).toString("hex")
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

        // Create token in database (expires in 15 minutes)
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            },
        })

        // TODO: Send email with reset link
        // For now, log it (in production, use email service)
        const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`

        console.log("=== PASSWORD RESET LINK ===")
        console.log(`User: ${user.email}`)
        console.log(`Reset URL: ${resetUrl}`)
        console.log("===========================")

        // In production, send email:
        // await sendPasswordResetEmail(user.email, resetUrl)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Forgot password error:", error)
        // Still return success to prevent enumeration
        return NextResponse.json({ success: true })
    }
}
