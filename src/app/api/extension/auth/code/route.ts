import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { createAuthCode } from "@/lib/extension-auth"
import { z } from "zod"

const requestSchema = z.object({
    state: z.string().min(1, "State is required"),
})

/**
 * POST /api/extension/auth/code
 *
 * Creates a one-time authorization code for the extension to exchange.
 * Requires authenticated session (user logged in on web).
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validation = requestSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { state } = validation.data
        const code = await createAuthCode(session.user.id, state)

        return NextResponse.json({ code })
    } catch (error) {
        console.error("Extension auth code error:", error)
        return NextResponse.json(
            { error: "Failed to create authorization code" },
            { status: 500 }
        )
    }
}
