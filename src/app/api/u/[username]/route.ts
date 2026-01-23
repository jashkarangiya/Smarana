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
                isProfilePublic: true,
                showStreakPublicly: true,
                showLeetCodePublicly: true,
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
                    where: {
                        date: {
                            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                        }
                    },
                    select: {
                        date: true,
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
        const isPublic = user.isProfilePublic

        // If private and not self/friend -> 403 or limited view
        // Requirement: "If Friends only: require auth + friendship"
        // We'll interpret !isProfilePublic as "Friends Only" mostly, or "Private".
        // Let's assume isProfilePublic=false means "Friends Only".
        // True "Private" (hidden from everyone) isn't in requirements yet, but let's be safe.

        const canViewProfile = isPublic || isFriend || isSelf

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
                    currentStreak: (isSelf || user.showStreakPublicly) ? (user.stats?.currentStreak || 0) : null,
                    longestStreak: (isSelf || user.showStreakPublicly) ? (user.stats?.longestStreak || 0) : null,
                    leetcodeActivity: (isSelf || user.showLeetCodePublicly) ? (user.stats?.leetcodeActivity || null) : null,
                },
                leetcodeUsername: (isSelf || user.showLeetCodePublicly) ? user.leetcodeUsername : null,
            },
            activityHeatmap: user.reviewLogs.reduce((acc, log) => {
                const dateStr = log.date.toISOString().split("T")[0]
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
