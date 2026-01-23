"use client"

import { useQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Flame, Trophy, Target, Calendar, UserPlus, UserCheck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Heatmap } from "@/components/heatmap" // Reuse existing heatmap component
import { LeetCodeHeatmap } from "@/components/leetcode-heatmap"
import { motion } from "framer-motion"
import { Code2 } from "lucide-react"

interface UserProfile {
    isPrivate: boolean
    isFriend: boolean
    isSelf: boolean
    user: {
        id: string
        name: string
        username: string
        image: string
        level: number
        xp: number
        createdAt: string
        stats: {
            totalReviews: number
            problemsTracked: number
            reviewsThisWeek: number
            currentStreak: number | null // null if hidden
            longestStreak: number | null
            leetcodeActivity: string | null
        }
        leetcodeUsername: string | null
        showLeetCodePublicly: boolean
    }
}

async function getProfile(username: string): Promise<UserProfile> {
    const res = await fetch(`/api/u/${username}`)
    if (res.status === 404) throw new Error("User not found")
    if (!res.ok) throw new Error("Failed to fetch profile")
    return res.json()
}

export default function PublicProfilePage({ params }: { params: { username: string } }) {
    const { data: profile, isLoading, error } = useQuery({
        queryKey: ["profile", params.username],
        queryFn: () => getProfile(params.username),
        retry: false
    })

    if (error) {
        // Simple error handling, could be better
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold">User not found</h1>
                <p className="text-muted-foreground">The user @{params.username} does not exist.</p>
            </div>
        )
    }

    if (isLoading) {
        return <ProfileSkeleton />
    }

    if (!profile) return null

    if (profile.isPrivate) {
        return (
            <div className="container max-w-4xl py-10">
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-muted/5">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={profile.user.image} />
                        <AvatarFallback>{profile.user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold">{profile.user.name}</h1>
                    <p className="text-muted-foreground mb-6">@{profile.user.username}</p>

                    <div className="flex items-center gap-2 px-4 py-2 bg-background border rounded-full text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        This profile is private
                    </div>
                </div>
            </div>
        )
    }

    const { user } = profile

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            {/* Hero Card */}
            <div className="card-glow rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white/10 shadow-xl">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="text-4xl bg-white/10 text-white">{user.name?.[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{user.name}</h1>
                            <p className="text-white/60 text-lg">@{user.username}</p>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none py-1.5 px-3">
                                Level {user.level}
                            </Badge>
                            <Badge variant="outline" className="border-white/20 text-white py-1.5 px-3">
                                {user.xp} XP
                            </Badge>
                            <span className="text-sm text-white/50 flex items-center">
                                Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {!profile.isSelf && (
                            <Button
                                className={`rounded-full ${profile.isFriend ? "bg-white/10 hover:bg-white/20" : "bg-white text-black hover:bg-white/90"}`}
                                disabled={profile.isFriend} // Or handle remove
                            >
                                {profile.isFriend ? (
                                    <>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Friends
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Friend
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Current Streak"
                    value={user.stats.currentStreak ?? "Hidden"}
                    hidden={user.stats.currentStreak === null}
                    icon={<Flame className="h-5 w-5 text-orange-500" />}
                />
                <StatCard
                    label="Problems Tracked"
                    value={user.stats.problemsTracked}
                    icon={<Target className="h-5 w-5 text-primary" />}
                />
                <StatCard
                    label="Total Reviews"
                    value={user.stats.totalReviews}
                    icon={<Calendar className="h-5 w-5 text-blue-500" />}
                />
                <StatCard
                    label="Longest Streak"
                    value={user.stats.longestStreak ?? "Hidden"}
                    hidden={user.stats.longestStreak === null}
                    icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Activity Heatmap Area (Using current user's heatmap component for now, simplified) */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {user.stats.reviewsThisWeek} reviews this week
                            </p>
                            {/* Placeholder for now as Heatmap component needs refactor to accept userId */}
                            <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                                Activity Heatmap Coming Soon
                            </div>
                        </CardContent>
                    </Card>

                    {/* Maybe recent achievements here later */}
                    {/* Recent Activity (Private for now or could be extended) */}
                </div>

                {/* LeetCode History */}
                {user.showLeetCodePublicly && user.stats?.leetcodeActivity && (
                    <div className="md:col-span-3 space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-green-500" />
                            LeetCode Activity
                        </h2>
                        <Card className="p-6 border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                            <LeetCodeHeatmap data={user.stats.leetcodeActivity} />
                        </Card>
                    </div>
                )}

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Identity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {user.leetcodeUsername ? (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">LeetCode</span>
                                    <a
                                        href={`https://leetcode.com/${user.leetcodeUsername}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium hover:underline"
                                    >
                                        {user.leetcodeUsername}
                                    </a>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground italic">No Linked Accounts publicly visible</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, hidden }: { label: string, value: string | number, icon: React.ReactNode, hidden?: boolean }) {
    return (
        <Card className={hidden ? "opacity-60" : ""}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
                    {icon}
                </div>
                <div className="text-2xl font-bold tracking-tight">
                    {hidden ? <span className="text-lg text-muted-foreground blur-sm select-none">123</span> : value}
                </div>
            </CardContent>
        </Card>
    )
}

function ProfileSkeleton() {
    return (
        <div className="container max-w-5xl py-8 space-y-8">
            <Skeleton className="h-64 rounded-3xl w-full" />
            <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
            </div>
        </div>
    )
}
