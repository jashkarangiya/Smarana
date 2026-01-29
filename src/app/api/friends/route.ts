import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Parallel fetch: Friends, Received Requests, Sent Requests
        const [friends, receivedRequests, sentRequests] = await Promise.all([
            // Friends
            prisma.friendship.findMany({
                where: { userId: session.user.id },
                include: {
                    friend: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                            level: true,
                            xp: true,
                            leetcodeUsername: true,
                            stats: {
                                select: {
                                    currentStreak: true,
                                    reviewsThisWeek: true,
                                    totalReviews: true
                                }
                            }
                        }
                    }
                }
            }),
            // Received Requests
            prisma.friendRequest.findMany({
                where: { receiverId: session.user.id, status: "PENDING" },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                            level: true
                        }
                    }
                }
            }),
            // Sent Requests (useful to show "Pending" status on UI)
            prisma.friendRequest.findMany({
                where: { senderId: session.user.id, status: "PENDING" },
                select: { receiverId: true }
            })
        ])

        // Compute reviewedToday for each friend
        const today = new Date().toISOString().split('T')[0]

        const friendsWithStats = await Promise.all(friends.map(async (f) => {
            const todayLog = await prisma.reviewLog.findFirst({
                where: {
                    userId: f.friend.id,
                    day: today
                }
            })

            return {
                ...f.friend,
                stats: {
                    ...f.friend.stats,
                    reviewedToday: todayLog?.count || 0
                }
            }
        }))

        return NextResponse.json({
            friends: friendsWithStats,
            requests: receivedRequests.map(r => ({ ...r.sender, requestId: r.id, createdAt: r.createdAt })),
            sentRequestIds: sentRequests.map(r => r.receiverId)
        })

    } catch (error) {
        console.error("Fetch friends error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
