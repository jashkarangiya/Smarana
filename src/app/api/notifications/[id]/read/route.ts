import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const notification = await prisma.notification.updateMany({
            where: {
                id,
                userId: session.user.id,
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        })

        if (notification.count === 0) {
            return NextResponse.json({ error: "Notification not found or already read" }, { status: 404 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Mark notification read error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
