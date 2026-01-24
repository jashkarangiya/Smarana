import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const searchParams = req.nextUrl.searchParams
        const cursor = searchParams.get("cursor")
        const limit = 20

        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit + 1, // Take one extra to check if there's a next page
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
        })

        const hasMore = notifications.length > limit
        const items = hasMore ? notifications.slice(0, limit) : notifications
        const nextCursor = hasMore ? items[items.length - 1].id : null

        // Get unread count
        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                readAt: null
            }
        })

        return NextResponse.json({
            items,
            nextCursor,
            unreadCount
        })

    } catch (error) {
        console.error("Notifications fetch error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
