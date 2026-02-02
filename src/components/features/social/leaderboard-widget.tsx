"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Flame, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface FriendWithStats {
    id: string
    name: string
    username: string
    image?: string
    level: number
    stats?: {
        currentStreak: number
        reviewsThisWeek: number
        totalReviews: number
    }
}

export function LeaderboardWidget() {
    const [friends, setFriends] = useState<FriendWithStats[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/friends")
            .then(res => res.json())
            .then(data => {
                // Sort by streak desc
                const sorted = (data.friends || []).sort((a: FriendWithStats, b: FriendWithStats) =>
                    (b.stats?.currentStreak || 0) - (a.stats?.currentStreak || 0)
                )
                setFriends(sorted)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (friends.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-6">
                    <p className="text-sm text-muted-foreground">Add friends to compete!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Streak Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {friends.slice(0, 5).map((friend, index) => (
                    <Link href={`/u/${friend.username}`} key={friend.id}>
                        <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className={`w-6 text-center font-bold text-sm ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                                #{index + 1}
                            </div>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={friend.image} />
                                <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                    {friend.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Level {friend.level}
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
            </CardContent>
        </Card>
    )
}
