"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
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

export function SocialPulseCard({ className }: { className?: string }) {
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

    // Empty state is now handled inside sections to keep layout stable

    // Get recent activity (friends who reviewed today)
    const activeToday = data?.friends.filter(f => (f.stats?.reviewedToday || 0) > 0) || []

    return (
        <Card className={cn("flex flex-col h-full min-h-0 overflow-hidden", className)}>
            <CardHeader className="pb-3 shrink-0 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#BB7331]" />
                    <span className="font-semibold text-base">Social Pulse</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2" asChild>
                    <Link href="/friends">
                        View all <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="space-y-6 min-h-0 flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar">
                {/* Friend Requests Alert */}
                {hasPending && data && (
                    <Link href="/friends" className="block">
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#BB7331]/10 border border-[#BB7331]/20 hover:bg-[#BB7331]/15 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-[#BB7331]/20 flex items-center justify-center">
                                <Bell className="h-4 w-4 text-[#BB7331]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">
                                    {data.pendingRequests.length} pending request{data.pendingRequests.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-[#BB7331]" />
                        </div>
                    </Link>
                )}

                {/* Streak Leaderboard - Top 3 */}
                <section className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-white/50">
                        <Trophy className="h-3.5 w-3.5" />
                        Streak Leaderboard
                    </div>

                    {hasFriends && topThree.length > 0 ? (
                        <div className="space-y-1">
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
                                            {/* eslint-disable-next-line react/no-children-prop */}
                                            <AvatarFallback children={friend.name?.[0]} className="text-xs" />
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
                    ) : (
                        <div className="rounded-lg border border-dashed border-white/5 bg-white/5 p-4 text-center">
                            <p className="text-sm font-medium text-white/70">No leaderboard yet</p>
                            <p className="text-xs text-white/30 mt-0.5">Add friends to see rankings.</p>
                            <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs text-[#BB7331]" asChild>
                                <Link href="/friends">Add Friends</Link>
                            </Button>
                        </div>
                    )}
                </section>

                {/* Recent Activity */}
                <section className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-white/50">
                        <Flame className="h-3.5 w-3.5" />
                        Active Today
                    </div>

                    {activeToday.length > 0 ? (
                        <div className="space-y-1.5">
                            {activeToday.slice(0, 3).map((friend) => (
                                <Link href={`/u/${friend.username}`} key={friend.id} className="block group">
                                    <div className="text-xs text-muted-foreground flex items-center gap-2 p-2 rounded-lg group-hover:bg-white/5 transition-colors">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={friend.image} />
                                            {/* eslint-disable-next-line react/no-children-prop */}
                                            <AvatarFallback children={friend.name?.[0]} className="text-[10px]" />
                                        </Avatar>
                                        <span className="truncate">
                                            <span className="font-medium text-foreground">{friend.name?.split(' ')[0]}</span>
                                            {' '}reviewed <span className="text-[#BB7331]">{friend.stats?.reviewedToday}</span> problems
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-white/5 bg-white/5 p-4 text-center">
                            <p className="text-sm font-medium text-white/70">No activity yet</p>
                            <p className="text-xs text-white/30 mt-0.5">Friend activity will show up here.</p>
                        </div>
                    )}
                </section>
            </CardContent>
        </Card>
    )
}
