"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Flame, Trophy, Target, Calendar, UserPlus, UserCheck, Shield, Code2, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import dynamic from "next/dynamic"

const Heatmap = dynamic(() => import("@/components/features/gamification/heatmap").then(mod => mod.Heatmap), {
    loading: () => <div className="h-[200px] w-full animate-pulse bg-muted/10 rounded-lg" />,
    ssr: false
})

const LeetCodeHeatmap = dynamic(() => import("@/components/features/gamification/leetcode-heatmap").then(mod => mod.LeetCodeHeatmap), {
    loading: () => <div className="h-[200px] w-full animate-pulse bg-muted/10 rounded-lg" />,
    ssr: false
})
import { LocalTime } from "@/components/shared/local-time"
import { ProfileEmberDot } from "@/components/features/profile/profile-ember-dot"
import { AchievementsList } from "@/components/features/gamification/achievements-list"


interface UserProfile {
    isPrivate: boolean
    isFriend: boolean
    isSelf: boolean
    user: {
        id: string
        name: string
        username: string
        image: string
        bio: string | null
        timezone: string | null
        level: number
        xp: number
        createdAt: string
        stats: {
            totalReviews: number
            problemsTracked: number
            reviewsThisWeek: number
            currentStreak: number | null
            longestStreak: number | null
            leetcodeActivity: string | null
            unlockedAchievements: string[]
        }
        leetcodeUsername: string | null
        codeforcesUsername: string | null
        codechefUsername: string | null
        atcoderUsername: string | null
        platformVerifications?: Record<string, { verified: boolean; verifiedAt: string | null }>
    }
    activityHeatmap: Record<string, number>
}

async function getProfile(username: string): Promise<UserProfile> {
    const res = await fetch(`/api/u/${username}`)
    if (res.status === 404) throw new Error("User not found")
    if (!res.ok) throw new Error("Failed to fetch profile")
    return res.json()
}

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params)
    const { data: profile, isLoading, error } = useQuery({
        queryKey: ["profile", username],
        queryFn: () => getProfile(username),
        retry: false
    })

    if (error) {
        notFound()
        return null
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
        <div className="container max-w-7xl py-8 pt-24 space-y-8">
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

                        {/* Bio */}
                        {user.bio && (
                            <p className="text-sm text-white/60 leading-relaxed line-clamp-3 max-w-xl">
                                {user.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
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

                        {/* Local Time with Profile Ember Dot */}
                        {user.timezone && (
                            <div className="flex items-center gap-2 text-xs">
                                <LocalTime timezone={user.timezone} className="flex items-center" />
                                <ProfileEmberDot />
                            </div>
                        )}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Heatmap Area */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2 sm:pb-4">
                            <CardTitle className="text-base">Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="px-3 sm:px-6 pb-2">
                                <p className="text-sm text-muted-foreground">
                                    {user.stats.reviewsThisWeek} reviews this week
                                </p>
                            </div>
                            {/* Scrollable heatmap wrapper */}
                            <div className="relative">
                                <div className="overflow-x-auto px-3 sm:px-6 pb-4 sm:pb-6">
                                    <Heatmap
                                        data={profile.activityHeatmap}
                                        className="min-w-max"
                                        year={new Date().getFullYear()}
                                    />
                                </div>
                                {/* Fade edges for scroll indication on mobile */}
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-card to-transparent lg:hidden" />
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card to-transparent lg:hidden" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Achievements Section */}
                    <div className="lg:col-span-2">
                        <AchievementsList
                            unlockedIds={user.stats.unlockedAchievements || []}
                            isSelf={profile.isSelf}
                        />
                    </div>

                    {/* Maybe recent achievements here later */}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-4 sm:space-y-6">
                    <Card>
                        <CardHeader className="pb-2 sm:pb-4">
                            <CardTitle className="text-base">Platforms</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-3">
                            {user.leetcodeUsername && (
                                <PlatformRow
                                    name="LeetCode"
                                    username={user.leetcodeUsername}
                                    href={`https://leetcode.com/${user.leetcodeUsername}`}
                                    isVerified={user.platformVerifications?.leetcode?.verified}
                                />
                            )}
                            {user.codeforcesUsername && (
                                <PlatformRow
                                    name="Codeforces"
                                    username={user.codeforcesUsername}
                                    href={`https://codeforces.com/profile/${user.codeforcesUsername}`}
                                    isVerified={user.platformVerifications?.codeforces?.verified}
                                />
                            )}
                            {user.codechefUsername && (
                                <PlatformRow
                                    name="CodeChef"
                                    username={user.codechefUsername}
                                    href={`https://www.codechef.com/users/${user.codechefUsername}`}
                                    isVerified={user.platformVerifications?.codechef?.verified}
                                />
                            )}
                            {user.atcoderUsername && (
                                <PlatformRow
                                    name="AtCoder"
                                    username={user.atcoderUsername}
                                    href={`https://atcoder.jp/users/${user.atcoderUsername}`}
                                    isVerified={user.platformVerifications?.atcoder?.verified}
                                />
                            )}
                            {!user.leetcodeUsername && !user.codeforcesUsername && !user.codechefUsername && !user.atcoderUsername && (
                                <div className="text-sm text-muted-foreground italic">No platforms visible</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* LeetCode History */}
                {user.stats?.leetcodeActivity && (
                    <div className="lg:col-span-3 space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-green-500" />
                            LeetCode Activity
                        </h2>
                        <Card className="p-6 border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                            <LeetCodeHeatmap data={user.stats.leetcodeActivity} />
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, hidden }: { label: string, value: string | number, icon: React.ReactNode, hidden?: boolean }) {
    return (
        <Card className={hidden ? "opacity-60" : ""}>
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">{label}</p>
                    {icon}
                </div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight">
                    {hidden ? <span className="text-lg text-muted-foreground blur-sm select-none">123</span> : value}
                </div>
            </CardContent>
        </Card>
    )
}

function PlatformRow({ name, username, href, isVerified }: { name: string; username: string; href: string; isVerified?: boolean }) {
    return (
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3 sm:p-4">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-1 text-sm font-medium">
                        {name}
                        {isVerified && <BadgeCheck className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground truncate">@{username}</div>
                </div>
                <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors w-fit"
                >
                    View
                </a>
            </div>
        </div>
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
