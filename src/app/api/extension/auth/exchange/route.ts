import { NextResponse } from "next/server"
import { exchangeAuthCode } from "@/lib/extension-auth"
import { z } from "zod"

const requestSchema = z.object({
    code: z.string().min(1, "Code is required"),
})

/**
 * POST /api/extension/auth/exchange
 *
 * Exchanges a one-time authorization code for access and refresh tokens.
 * Called by the extension after user completes the connect flow.
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

        const { code } = validation.data
        const result = await exchangeAuthCode(code)

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Extension auth exchange error:", error)
        return NextResponse.json(
            { error: "Failed to exchange authorization code" },
            { status: 500 }
        )
    }
}
