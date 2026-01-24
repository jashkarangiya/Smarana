import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params
        const session = await getServerSession(authOptions)
        const viewerId = session?.user?.id

        // 1. Fetch target user with privacy settings + stats
        const user = await prisma.user.findFirst({
            where: {
                usernameLower: username.toLowerCase()
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                level: true,
                xp: true,
                profileVisibility: true,
                showStreak: true,
                showPlatforms: true,
                createdAt: true, // "Joined Jan 2025"
                stats: {
                    select: {
                        currentStreak: true,
                        longestStreak: true,
                        totalReviews: true,
                        problemsTracked: true,
                        reviewsThisWeek: true,
                        leetcodeActivity: true,
                    }
                },
                leetcodeUsername: true, // Checked later based on privacy
                friendsAsUser: { where: { friendId: viewerId || "" }, select: { id: true } }, // Check friendship A->B
                friendsAsFriend: { where: { userId: viewerId || "" }, select: { id: true } }, // Check friendship B->A
                reviewLogs: {
                    // Fetch logs for roughly last 370 days (to be safe)
                    // Since day is YYYYMMDD int, we can estimate range or just fetch "last 400 entries"
                    // Or precise math: 20250123.
                    // Let's just fetch last 400 for MVP since indexing by day is efficient.
                    orderBy: {
                        day: 'desc'
                    },
                    take: 400,
                    select: {
                        day: true,
                        count: true
                    }
                }
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // 2. Privacy Logic
        const isSelf = viewerId === user.id
        const isFriend = user.friendsAsUser.length > 0 || user.friendsAsFriend.length > 0
        // Visibility: PUBLIC (everyone), FRIENDS (friends only), PRIVATE (only self)

        let canViewProfile = false
        if (isSelf) canViewProfile = true
        else if (user.profileVisibility === "PUBLIC") canViewProfile = true
        else if (user.profileVisibility === "FRIENDS" && isFriend) canViewProfile = true

        if (!canViewProfile) {
            return NextResponse.json({
                isPrivate: true,
                user: {
                    name: user.name,
                    username: user.username,
                    image: user.image, // Basic info allowed
                }
            })
        }

        // 3. Assemble Response
        const responseData = {
            isPrivate: false,
            isFriend,
            isSelf,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
                level: user.level,
                xp: user.xp,
                createdAt: user.createdAt,
                stats: {
                    totalReviews: user.stats?.totalReviews || 0,
                    problemsTracked: user.stats?.problemsTracked || 0,
                    reviewsThisWeek: user.stats?.reviewsThisWeek || 0,
                    // Streak privacy
                    currentStreak: (isSelf || user.showStreak) ? (user.stats?.currentStreak || 0) : null,
                    longestStreak: (isSelf || user.showStreak) ? (user.stats?.longestStreak || 0) : null,
                    leetcodeActivity: (isSelf || user.showPlatforms) ? (user.stats?.leetcodeActivity || null) : null,
                },
                leetcodeUsername: (isSelf || user.showPlatforms) ? user.leetcodeUsername : null,
                showStreakPublicly: user.showStreak, // Mapping old to new for frontend compat
                showLeetCodePublicly: user.showPlatforms,
            },
            activityHeatmap: user.reviewLogs.reduce((acc, log) => {
                // Convert YYYYMMDD -> YYYY-MM-DD
                const d = String(log.day)
                const dateStr = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
                acc[dateStr] = log.count
                return acc
            }, {} as Record<string, number>)
        }

        return NextResponse.json(responseData)

    } catch (error) {
        console.error("GET public profile error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
