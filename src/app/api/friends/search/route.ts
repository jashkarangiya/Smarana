import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const searchParams = req.nextUrl.searchParams
        const query = searchParams.get("q")

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ users: [] })
        }

        const searchTerm = query.trim()

        // Search for users by username or name
        const searchLower = searchTerm.toLowerCase()
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: session.user.id } }, // Exclude current user
                    {
                        OR: [
                            { usernameLower: { contains: searchLower } },
                            { name: { contains: searchTerm } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                level: true,
                xp: true,
            },
            take: 10, // Limit results
            orderBy: [
                // Prioritize exact username matches
                { username: 'asc' }
            ]
        })

        // Get existing friendships and pending requests to filter results
        const [friendships, sentRequests, receivedRequests] = await Promise.all([
            prisma.friendship.findMany({
                where: {
                    OR: [
                        { userId: session.user.id },
                        { friendId: session.user.id }
                    ]
                },
                select: {
                    userId: true,
                    friendId: true
                }
            }),
            prisma.friendRequest.findMany({
                where: {
                    senderId: session.user.id,
                    status: "PENDING"
                },
                select: { receiverId: true }
            }),
            prisma.friendRequest.findMany({
                where: {
                    receiverId: session.user.id,
                    status: "PENDING"
                },
                select: { senderId: true }
            })
        ])

        // Build sets for quick lookup
        const friendIds = new Set<string>()
        friendships.forEach(f => {
            friendIds.add(f.userId === session.user.id ? f.friendId : f.userId)
        })

        const sentRequestIds = new Set(sentRequests.map(r => r.receiverId))
        const receivedRequestIds = new Set(receivedRequests.map(r => r.senderId))

        // Annotate users with relationship status
        const annotatedUsers = users.map(user => ({
            ...user,
            relationshipStatus: friendIds.has(user.id)
                ? 'friend'
                : sentRequestIds.has(user.id)
                ? 'request_sent'
                : receivedRequestIds.has(user.id)
                ? 'request_received'
                : 'none'
        }))

        return NextResponse.json({ users: annotatedUsers })

    } catch (error) {
        console.error("Friend search error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
