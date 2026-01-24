import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Mark all read error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
