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
                bio: true,
                timezone: true,
                level: true,
                xp: true,
                profileVisibility: true,
                showStreakToPublic: true,
                showStreakToFriends: true,
                showPlatformsToPublic: true,
                showPlatformsToFriends: true,
                showBioPublicly: true,
                showTimezoneToPublic: true,
                showTimezoneToFriends: true,
                createdAt: true,
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
                leetcodeUsername: true,
                codeforcesUsername: true,
                codechefUsername: true,
                atcoderUsername: true,
                platformVerifications: {
                    where: { isVerified: true },
                    select: { platform: true, verifiedAt: true }
                },
                friendsAsUser: { where: { friendId: viewerId || "" }, select: { id: true } },
                friendsAsFriend: { where: { userId: viewerId || "" }, select: { id: true } },
                reviewLogs: {
                    where: {
                        day: {
                            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]
                        }
                    },
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
        const visibility = user.profileVisibility

        // Determine access based on profileVisibility
        let canViewProfile = false
        if (visibility === "PUBLIC") {
            canViewProfile = true
        } else if (visibility === "FRIENDS_ONLY") {
            canViewProfile = isSelf || isFriend
        } else if (visibility === "PRIVATE") {
            canViewProfile = isSelf
        }

        if (!canViewProfile) {
            return NextResponse.json({
                isPrivate: true,
                isFriend,
                isSelf,
                user: {
                    name: user.name,
                    username: user.username,
                    image: user.image,
                }
            })
        }

        // 3. Determine visibility for streak, platforms, bio, and timezone
        const canViewStreak = isSelf ||
            (isFriend && user.showStreakToFriends) ||
            (!isFriend && user.showStreakToPublic)

        const canViewPlatforms = isSelf ||
            (isFriend && user.showPlatformsToFriends) ||
            (!isFriend && user.showPlatformsToPublic)

        const canViewBio = isSelf || user.showBioPublicly

        const canViewTimezone = isSelf ||
            (isFriend && user.showTimezoneToFriends) ||
            (!isFriend && user.showTimezoneToPublic)

        // 4. Assemble Response
        const responseData = {
            isPrivate: false,
            isFriend,
            isSelf,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
                bio: canViewBio ? user.bio : null,
                timezone: canViewTimezone ? user.timezone : null,
                level: user.level,
                xp: user.xp,
                createdAt: user.createdAt,
                stats: {
                    totalReviews: user.stats?.totalReviews || 0,
                    problemsTracked: user.stats?.problemsTracked || 0,
                    reviewsThisWeek: user.stats?.reviewsThisWeek || 0,
                    currentStreak: canViewStreak ? (user.stats?.currentStreak || 0) : null,
                    longestStreak: canViewStreak ? (user.stats?.longestStreak || 0) : null,
                    leetcodeActivity: canViewPlatforms ? (user.stats?.leetcodeActivity || null) : null,
                },
                leetcodeUsername: canViewPlatforms ? user.leetcodeUsername : null,
                codeforcesUsername: canViewPlatforms ? user.codeforcesUsername : null,
                codechefUsername: canViewPlatforms ? user.codechefUsername : null,
                atcoderUsername: canViewPlatforms ? user.atcoderUsername : null,
                platformVerifications: canViewPlatforms ? user.platformVerifications.reduce((acc, v) => {
                    acc[v.platform] = { verified: true, verifiedAt: v.verifiedAt }
                    return acc
                }, {} as Record<string, { verified: boolean; verifiedAt: Date | null }>) : {},
            },
            activityHeatmap: user.reviewLogs.reduce((acc, log) => {
                acc[log.day] = log.count
                return acc
            }, {} as Record<string, number>)
        }

        return NextResponse.json(responseData)

    } catch (error) {
        console.error("GET public profile error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
