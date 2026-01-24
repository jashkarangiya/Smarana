import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json({ valid: false })
        }

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
        })

        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
            return NextResponse.json({ valid: false })
        }

        return NextResponse.json({ valid: true })
    } catch (error) {
        console.error("Verify token error:", error)
        return NextResponse.json({ valid: false })
    }
}
