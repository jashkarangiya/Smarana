"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Flame, Trophy, Activity, ArrowRight, UserPlus, Bell } from "lucide-react"
import Link from "next/link"

interface FriendData {
    id: string
    name: string
    username: string
    image?: string
    level: number
    stats?: {
        currentStreak: number
        reviewsThisWeek: number
        totalReviews: number
        reviewedToday: number
    }
}

interface PendingRequest {
    id: string
    name: string
    username: string
    image?: string
}

interface SocialPulseData {
    friends: FriendData[]
    pendingRequests: PendingRequest[]
    userRank: number | null
    userStreak: number
}

export function SocialPulseCard() {
    const [data, setData] = useState<SocialPulseData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/friends")
                const friendsData = await res.json()

                // Sort friends by streak descending
                const sortedFriends = (friendsData.friends || []).sort(
                    (a: FriendData, b: FriendData) =>
                        (b.stats?.currentStreak || 0) - (a.stats?.currentStreak || 0)
                )

                setData({
                    friends: sortedFriends,
                    pendingRequests: friendsData.requests || [],
                    userRank: null,
                    userStreak: 0
                })
            } catch (error) {
                console.error("Failed to fetch social pulse data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            Social Pulse
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        )
    }

    const hasFriends = data && data.friends.length > 0
    const hasPending = data && data.pendingRequests.length > 0
    const topThree = data?.friends.slice(0, 3) || []

    // Empty state - no friends
    if (!hasFriends && !hasPending) {
        return (
            <Card className="overflow-hidden border-dashed">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Social Pulse
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="text-center py-6 space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Find your study buddies</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Connect with friends to compete and stay motivated
                        </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                        <Link href="/friends">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Find Friends
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Get recent activity (friends who reviewed today)
    const activeToday = data?.friends.filter(f => (f.stats?.reviewedToday || 0) > 0) || []

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        Social Pulse
                        {hasPending && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                        )}
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2" asChild>
                        <Link href="/friends">
                            View all <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Friend Requests Alert */}
                {hasPending && (
                    <Link href="/friends" className="block">
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <Bell className="h-4 w-4 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">
                                    {data.pendingRequests.length} pending request{data.pendingRequests.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-orange-500" />
                        </div>
                    </Link>
                )}

                {/* Friend Strip - Avatar Stack */}
                {hasFriends && (
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {data.friends.slice(0, 5).map((friend) => (
                                <Link href={`/u/${friend.username}`} key={friend.id}>
                                    <Avatar className="h-9 w-9 border-2 border-background hover:z-10 hover:scale-110 transition-transform cursor-pointer">
                                        <AvatarImage src={friend.image} />
                                        <AvatarFallback className="text-xs">
                                            {friend.name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                            ))}
                        </div>
                        {data.friends.length > 5 && (
                            <span className="text-xs text-muted-foreground ml-1">
                                +{data.friends.length - 5} more
                            </span>
                        )}
                    </div>
                )}

                {/* Streak Leaderboard - Top 3 */}
                {topThree.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                            <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                            Streak Leaderboard
                        </div>
                        {topThree.map((friend, index) => (
                            <Link href={`/u/${friend.username}`} key={friend.id}>
                                <div className="group flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className={`w-5 text-center font-bold text-xs ${index === 0 ? "text-yellow-500" :
                                        index === 1 ? "text-gray-400" :
                                            "text-amber-600"
                                        }`}>
                                        #{index + 1}
                                    </div>
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={friend.image} />
                                        <AvatarFallback className="text-xs">{friend.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                            {friend.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                                        <span className="text-sm font-bold tabular-nums">
                                            {friend.stats?.currentStreak || 0}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Recent Activity */}
                {activeToday.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                        <div className="text-xs font-medium text-muted-foreground">
                            🔥 Active Today
                        </div>
                        <div className="space-y-1.5">
                            {activeToday.slice(0, 2).map((friend) => (
                                <div key={friend.id} className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={friend.image} />
                                        <AvatarFallback className="text-[10px]">{friend.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span>
                                        <span className="font-medium text-foreground">{friend.name?.split(' ')[0]}</span>
                                        {' '}reviewed {friend.stats?.reviewedToday} today
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
