import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function GET() {
    const session = await getServerSession(authOptions)
    const headersList = await headers()

    // Check for session cookie presence (generic check, don't log value)
    const cookieHeader = headersList.get("cookie") || ""
    const hasNextAuthCookie = cookieHeader.includes("next-auth.session-token") || cookieHeader.includes("__Secure-next-auth.session-token")

    // Check Database Connection
    let dbStatus = "Unknown"
    let userCount = -1
    let dbError = null

    try {
        // Simple query to test connection
        userCount = await prisma.user.count()
        dbStatus = "Connected"
    } catch (e: any) {
        dbStatus = "Failed"
        dbError = e.message || String(e)
        // console.error("Debug DB Error:", e) // Use a simpler error log or skip to avoid cluttering vercel logs if not needed
    }

    return NextResponse.json({
        status: "Debug Info",
        timestamp: new Date().toISOString(),
        auth: {
            hasSession: !!session,
            user: session?.user || null,
        },
        database: {
            status: dbStatus,
            userCount,
            error: dbError
        },
        env: {
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            nextAuthUrl: process.env.NEXTAUTH_URL,
            nodeEnv: process.env.NODE_ENV,
        },
        request: {
            hasCookieHeader: !!cookieHeader,
            hasNextAuthCookie,
            cookieNames: cookieHeader.split(';').map(c => c.trim().split('=')[0]),
            host: headersList.get("host"),
            xForwardedHost: headersList.get("x-forwarded-host"),
        }
    })
}
