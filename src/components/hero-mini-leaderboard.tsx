"use client"

import { useState, useEffect } from "react"
import { Flame, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Friend {
    id: string
    name: string
    username: string
    stats?: {
        currentStreak: number
    }
}

interface HeroMiniLeaderboardProps {
    userStreak: number
}

export function HeroMiniLeaderboard({ userStreak }: HeroMiniLeaderboardProps) {
    const [leader, setLeader] = useState<Friend | null>(null)
    const [userRank, setUserRank] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/friends")
            .then(res => res.json())
            .then(data => {
                const friends = data.friends || []
                if (friends.length === 0) {
                    setLeader(null)
                    return
                }

                // Sort by streak descending
                const sorted = [...friends].sort(
                    (a: Friend, b: Friend) => (b.stats?.currentStreak || 0) - (a.stats?.currentStreak || 0)
                )

                // Find position where user would be inserted
                let rank = 1
                for (const f of sorted) {
                    if (userStreak >= (f.stats?.currentStreak || 0)) break
                    rank++
                }

                setLeader(sorted[0])
                setUserRank(rank)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [userStreak])

    // Don't show if loading or no friends
    if (loading || !leader) return null

    const leaderStreak = leader.stats?.currentStreak || 0
    const isUserLeading = userStreak >= leaderStreak
    const streakDiff = leaderStreak - userStreak

    return (
        <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 min-w-[160px]">
            <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                    <Trophy className="h-3 w-3 inline mr-1" />
                    Leaderboard
                </span>
            </div>

            {isUserLeading ? (
                <div className="text-center">
                    <span className="text-lg font-bold text-yellow-400">You're #1! 🏆</span>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Leader:</span>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-white truncate max-w-[80px]">
                                {leader.name?.split(' ')[0]}
                            </span>
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            <span className="text-sm font-bold text-white">{leaderStreak}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">You:</span>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-white/40">#{userRank}</span>
                            <Flame className="h-3.5 w-3.5 text-orange-500/50" />
                            <span className="text-sm font-bold text-white">{userStreak}</span>
                        </div>
                    </div>
                    {streakDiff > 0 && (
                        <p className="text-[10px] text-white/40 text-center pt-1">
                            {streakDiff} day{streakDiff > 1 ? 's' : ''} behind
                        </p>
                    )}
                </div>
            )}

            <Link
                href="/friends"
                className="flex items-center justify-center gap-1 text-[10px] text-white/40 hover:text-white/60 transition-colors mt-2"
            >
                View all <ArrowRight className="h-2.5 w-2.5" />
            </Link>
        </div>
    )
}
