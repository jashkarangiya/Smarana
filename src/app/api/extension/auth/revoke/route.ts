import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { revokeExtensionTokens } from "@/lib/extension-auth"

/**
 * POST /api/extension/auth/revoke
 *
 * Revokes all extension tokens for the authenticated user.
 * Called when user wants to disconnect the extension.
 */
export async function POST() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            )
        }

        await revokeExtensionTokens(session.user.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Extension auth revoke error:", error)
        return NextResponse.json(
            { error: "Failed to revoke tokens" },
            { status: 500 }
        )
    }
}
