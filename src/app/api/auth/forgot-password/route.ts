import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendEmail } from "@/lib/email/sendEmail"
import { resetPasswordEmail } from "@/lib/email/templates/resetPassword"

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

        // Send email with reset link
        const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
        const resetUrl = new URL("/reset-password", appUrl)
        resetUrl.searchParams.set("token", token)
        resetUrl.searchParams.set("email", email)

        console.log("=== PASSWORD RESET LINK ===")
        console.log(`User: ${user.email}`)
        console.log(`Reset URL: ${resetUrl.toString()}`)
        console.log("===========================")

        try {
            const logoUrl = new URL("/logo.png", appUrl).toString()

            const { subject, html, text } = resetPasswordEmail({
                appUrl,
                logoUrl,
                resetUrl: resetUrl.toString(),
                expiresMinutes: 15,
                userName: user.name,
            })

            await sendEmail({
                to: user.email!,
                subject,
                html,
                text,
            })
        } catch (emailError) {
            console.error("Failed to send password reset email:", emailError)
            // Continue to return success to client
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Forgot password error:", error)
        // Still return success to prevent enumeration
        return NextResponse.json({ success: true })
    }
}
