"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, Medal, TrendingUp, Flame } from "lucide-react"

interface LeaderboardUser {
    id: string
    name: string
    image?: string
    xp: number
    streak: number
    rank: number
    rankChange?: number // positive = moved up, negative = moved down
}

interface LeaderboardProps {
    users: LeaderboardUser[]
    currentUserId?: string
    className?: string
}

export function Leaderboard({ users, currentUserId, className = "" }: LeaderboardProps) {
    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-4 w-4 text-amber-400" />
        if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />
        if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
        return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{rank}</span>
    }

    const getRankChangeIndicator = (change?: number) => {
        if (!change || change === 0) return null
        if (change > 0) {
            return (
                <span className="flex items-center text-[10px] text-emerald-500">
                    <TrendingUp className="h-3 w-3" />
                    {change}
                </span>
            )
        }
        return (
            <span className="flex items-center text-[10px] text-rose-500">
                <TrendingUp className="h-3 w-3 rotate-180" />
                {Math.abs(change)}
            </span>
        )
    }

    if (users.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p className="text-sm">No leaderboard data yet</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Weekly Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {users.slice(0, 5).map((user, index) => {
                        const isCurrentUser = user.id === currentUserId
                        const isTopThree = user.rank <= 3

                        return (
                            <div
                                key={user.id}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isCurrentUser
                                        ? "bg-primary/10 border border-primary/30"
                                        : isTopThree
                                            ? "bg-secondary/50"
                                            : ""
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-6 flex items-center justify-center">
                                    {getRankIcon(user.rank)}
                                </div>

                                {/* Avatar */}
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.image} />
                                    <AvatarFallback className="text-xs bg-secondary">
                                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Name and streak */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-sm font-medium truncate ${isCurrentUser ? "text-primary" : ""}`}>
                                            {user.name}
                                            {isCurrentUser && <span className="text-xs ml-1 opacity-60">(you)</span>}
                                        </span>
                                    </div>
                                    {user.streak > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-orange-500">
                                            <Flame className="h-3 w-3" />
                                            {user.streak} day streak
                                        </div>
                                    )}
                                </div>

                                {/* XP and rank change */}
                                <div className="text-right">
                                    <div className="text-sm font-bold">{user.xp.toLocaleString()} XP</div>
                                    {getRankChangeIndicator(user.rankChange)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
