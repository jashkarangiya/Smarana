import { NextResponse } from "next/server"
import { refreshAccessToken } from "@/lib/extension-auth"
import { z } from "zod"

const requestSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
})

/**
 * POST /api/extension/auth/refresh
 *
 * Refreshes an expired access token using a valid refresh token.
 * Returns a new access token with updated expiration.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validation = requestSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { refreshToken } = validation.data
        const result = await refreshAccessToken(refreshToken)

        if (!result) {
            return NextResponse.json(
                { error: "Invalid or expired refresh token" },
                { status: 401 }
            )
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Extension auth refresh error:", error)
        return NextResponse.json(
            { error: "Failed to refresh token" },
            { status: 500 }
        )
    }
}
