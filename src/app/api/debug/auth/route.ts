import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET() {
    const session = await getServerSession(authOptions)
    const headersList = await headers()

    // Check for session cookie presence (generic check, don't log value)
    const cookieHeader = headersList.get("cookie") || ""
    const hasNextAuthCookie = cookieHeader.includes("next-auth.session-token") || cookieHeader.includes("__Secure-next-auth.session-token")

    return NextResponse.json({
        status: "Debug Info",
        timestamp: new Date().toISOString(),
        hasSession: !!session,
        user: session?.user || null,
        env: {
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            nextAuthUrl: process.env.NEXTAUTH_URL,
            nodeEnv: process.env.NODE_ENV,
        },
        request: {
            hasCookieHeader: !!cookieHeader,
            hasNextAuthCookie,
            host: headersList.get("host"),
            xForwardedHost: headersList.get("x-forwarded-host"),
        }
    })
}
