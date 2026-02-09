import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { dateKeyInTz, getEffectiveStreak } from "@/lib/streak"

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
                            timezone: true,
                            streakCurrent: true,
                            streakLastDate: true,
                            streakLongest: true,
                            stats: {
                                select: {
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
        const friendsWithStats = await Promise.all(friends.map(async (f) => {
            const timeZone = f.friend.timezone || "UTC"
            const todayKey = dateKeyInTz(new Date(), timeZone)
            const todayLog = await prisma.dailyReviewStat.findUnique({
                where: {
                    userId_dateKey: {
                        userId: f.friend.id,
                        dateKey: todayKey,
                    }
                }
            })

            return {
                ...f.friend,
                stats: {
                    ...f.friend.stats,
                    reviewedToday: todayLog?.reviewCount || 0,
                    currentStreak: getEffectiveStreak({
                        streakCurrent: f.friend.streakCurrent || 0,
                        streakLastDate: f.friend.streakLastDate,
                        now: new Date(),
                        timeZone,
                    }),
                    longestStreak: f.friend.streakLongest || 0,
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
