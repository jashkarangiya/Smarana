"use client"

import { useProblems, useReviewProblem, useUndoReview, useSync, useUser, useStats } from "@/hooks/use-problems"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

import { DailyChallenge } from "@/components/daily-challenge"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { FriendsList } from "@/components/friends-list"
import { ProblemNotesModal } from "@/components/problem-notes-modal"
import { LeaderboardWidget } from "@/components/leaderboard-widget"
import { SocialPulseCard } from "@/components/social-pulse-card"
import { ReviewQueueCard } from "@/components/review-queue-card"
import { HeroMiniLeaderboard } from "@/components/hero-mini-leaderboard"
import { formatDistanceToNow } from "date-fns"
import { Brain, CheckCircle2, Calendar, RefreshCw, ArrowUpRight, Flame, TrendingUp, Trophy, Star, Zap, Lightbulb, FileText, Share2, Timer, ArrowRight } from "lucide-react"
import { tipForUserTodayWithMix } from "@/lib/daily-tips"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { toast } from "sonner"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"

export default function DashboardPage() {
    const { data: user } = useUser()
    const { data: stats, isLoading: statsLoading } = useStats()
    const { data: dueProblems, isLoading: dueLoading } = useProblems("due")
    const { data: upcoming, isLoading: upcomingLoading } = useProblems("upcoming")
    const { mutate: sync, isPending: syncing } = useSync()

    // Derived state
    const totalDue = dueProblems?.length || 0
    const { mutate: review, isPending: reviewing } = useReviewProblem()
    const { mutate: undoReview } = useUndoReview()

    // Notes modal state
    const [notesModal, setNotesModal] = useState<{ isOpen: boolean; problemId: string; title: string }>({
        isOpen: false,
        problemId: "",
        title: "",
    })

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20"
            case "hard": return "text-rose-500 bg-rose-500/10 border-rose-500/20"
            default: return "text-muted-foreground bg-secondary"
        }
    }

    const getXpForDifficulty = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy": return 10
            case "medium": return 25
            case "hard": return 50
            default: return 10
        }
    }

    const handleReview = (problemId: string, difficulty: string, title: string) => {
        review(problemId, {
            onSuccess: () => {
                const xp = getXpForDifficulty(difficulty)
                toast.success(`+${xp} XP earned!`, {
                    description: `${difficulty} problem reviewed`,
                    action: {
                        label: "Undo",
                        onClick: () => {
                            undoReview(problemId, {
                                onSuccess: () => {
                                    toast.info("Review undone", {
                                        description: `${title} marked as not reviewed`,
                                    })
                                },
                                onError: () => {
                                    toast.error("Failed to undo review")
                                },
                            })
                        },
                    },
                })
            }
        })
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="min-h-[calc(100dvh-var(--nav-h))] flex flex-col container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl"
        >
            {/* Top Blocks Section */}
            <div>
                {/* Hero Section */}
                <motion.div variants={item} className="card-glow mb-6 sm:mb-8 p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                    {/* Background Decor handled by card-glow */}
                    <div className="relative z-10 space-y-3 sm:space-y-4 max-w-xl">
                        <div className="space-y-1.5 sm:space-y-2">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white/95">
                                Ready to recall, {user?.name?.split(' ')[0] || 'Developer'}?
                            </h1>
                            <p className="text-base sm:text-lg text-white/70">
                                You have <span className="font-semibold text-[#BB7331]">{totalDue} problems</span> due for review today.
                                <span className="hidden sm:inline">{totalDue > 0 ? " Keep that streak alive!" : " You're all caught up!"}</span>
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                            {totalDue > 0 ? (
                                <>
                                    <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base bg-[#BB7331] text-black hover:bg-[#b8862f] shadow-[0_0_20px_rgba(214,162,75,0.3)] hover:shadow-[0_0_30px_rgba(214,162,75,0.5)] transition-all">
                                        <Link href="/review">
                                            <Brain className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                            Start Review Session
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-5 sm:px-6 py-5 sm:py-6 text-sm sm:text-base border-white/20 bg-white/5 hover:bg-white/10 text-white">
                                        <Link href="/review?limit=5">
                                            <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#BB7331]" />
                                            Quick 5
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <Button asChild size="lg" className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base bg-white/10 text-white hover:bg-white/20 border border-white/10">
                                    <Link href="/problems">
                                        <Brain className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                        Browse Problems
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats - Streak + Mini Leaderboard */}
                    <div className="hidden lg:flex gap-4 relative z-10">
                        <div className="p-6 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex flex-col items-center gap-2 min-w-[140px]">
                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Current Streak</span>
                            <div className="flex items-center gap-2">
                                <Flame className={`h-8 w-8 ${stats?.streak ? "text-orange-500 fill-orange-500" : "text-white/20"}`} />
                                <span className="text-4xl font-bold text-white">{stats?.streak || 0}</span>
                            </div>
                            <span className="text-xs text-white/40">days</span>
                        </div>
                        <HeroMiniLeaderboard userStreak={stats?.streak || 0} />
                    </div>
                </motion.div>

                {/* Quick Actions Bar */}
                <motion.div variants={item} className="flex justify-end mb-4 sm:mb-6">
                    <Button onClick={() => sync()} disabled={syncing} variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Platforms"}
                    </Button>
                </motion.div>

                {/* Level & XP Card */}
                <motion.div variants={item}>
                    <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 interactive-card">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold">Level {stats?.level || 1}</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground">{stats?.xp || 0} XP total</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right ml-13 sm:ml-0">
                                    <p className="text-xs sm:text-sm font-medium">{Math.round(stats?.xpProgress || 0)}% to Level {(stats?.level || 1) + 1}</p>
                                    <p className="text-xs text-muted-foreground">{stats?.xpForNextLevel ? stats.xpForNextLevel - (stats.xp || 0) : 500} XP needed</p>
                                </div>
                            </div>
                            <Progress value={stats?.xpProgress || 0} className="h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stats Overview */}
                <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
                    <StatsCard
                        title="Total Problems"
                        value={statsLoading ? "-" : String(stats?.total || 0)}
                        icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
                    />
                    <StatsCard
                        title="Due Today"
                        value={dueLoading ? "-" : String(totalDue)}
                        icon={<Brain className="h-4 w-4 text-primary" />}
                    />
                    <StatsCard
                        title="Reviewed Today"
                        value={statsLoading ? "-" : String(stats?.reviewedToday || 0)}
                        icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    />
                    <StatsCard
                        title="Day Streak"
                        value={statsLoading ? "-" : String(stats?.streak || 0)}
                        icon={<Flame className="h-4 w-4 text-orange-500" />}
                        highlight={(stats?.streak ?? 0) > 0}
                    />
                </motion.div>
            </div>

            {/* Bottom Grid - Fills remaining height */}
            <motion.div variants={item} className="mt-2 flex-1 min-h-0">
                <div className="h-full grid gap-4 lg:grid-cols-[1.7fr_1fr] lg:gap-6 lg:items-stretch lg:min-h-[600px]">
                    {/* Main List: Due Problems */}
                    <div className="relative min-h-0 hidden lg:block">
                        <div className="absolute inset-0">
                            <ReviewQueueCard
                                problems={dueProblems || []}
                                isLoading={dueLoading}
                                onReview={handleReview}
                                onNotes={(id, title) => setNotesModal({ isOpen: true, problemId: id, title })}
                                isReviewing={reviewing}
                                className="h-full w-full"
                            />
                        </div>
                    </div>
                    {/* Mobile View (Standard Flow) */}
                    <div className="lg:hidden min-h-[500px]">
                        <ReviewQueueCard
                            problems={dueProblems || []}
                            isLoading={dueLoading}
                            onReview={handleReview}
                            onNotes={(id, title) => setNotesModal({ isOpen: true, problemId: id, title })}
                            isReviewing={reviewing}
                            className="h-full w-full"
                        />
                    </div>

                    {/* Right Rail */}
                    <div className="h-full grid grid-rows-[minmax(0,1fr)_auto] gap-4">
                        {/* Social Pulse - Expands */}
                        <div className="min-h-0">
                            <SocialPulseCard className="h-full" />
                        </div>

                        {/* Pinned Widgets (Tabs) */}
                        <div className="pt-0">
                            <Tabs defaultValue="challenge" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-4">
                                    <TabsTrigger value="challenge" title="Daily Challenge"><Zap className="h-4 w-4" /></TabsTrigger>
                                    <TabsTrigger value="upcoming" title="Upcoming"><Calendar className="h-4 w-4" /></TabsTrigger>
                                    <TabsTrigger value="focus" title="Focus"><Timer className="h-4 w-4" /></TabsTrigger>
                                </TabsList>

                                <TabsContent value="challenge" className="mt-0 space-y-4">
                                    {dueProblems && dueProblems.length > 0 ? (
                                        <DailyChallenge
                                            problem={{
                                                id: dueProblems[0].id,
                                                title: dueProblems[0].title,
                                                difficulty: dueProblems[0].difficulty,
                                                url: dueProblems[0].url,
                                            }}
                                            onComplete={() => handleReview(dueProblems[0].id, dueProblems[0].difficulty, dueProblems[0].title)}
                                        />
                                    ) : (
                                        <Card className="hover-card">
                                            <CardContent className="p-6 text-center text-muted-foreground">
                                                All done for today!
                                            </CardContent>
                                        </Card>
                                    )}
                                    <MotivationalTip />
                                </TabsContent>

                                <TabsContent value="upcoming" className="mt-0">
                                    <Card className="hover-card">
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Upcoming Reviews
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {upcomingLoading ? (
                                                <div className="space-y-4">
                                                    <Skeleton className="h-10 w-full" />
                                                    <Skeleton className="h-10 w-full" />
                                                </div>
                                            ) : upcoming && upcoming.length > 0 ? (
                                                <div className="space-y-4">
                                                    {upcoming.slice(0, 5).map((problem: any) => (
                                                        <div key={problem.id} className="flex items-center justify-between text-sm">
                                                            <span className="truncate flex-1 pr-4 font-medium">{problem.title}</span>
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {formatDistanceToNow(new Date(problem.nextReviewAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs h-8 mt-2" asChild>
                                                        <Link href="/problems">View All</Link>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-4">No upcoming reviews</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="focus" className="mt-0">
                                    <PomodoroTimer />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Notes Modal */}
            <ProblemNotesModal
                problemId={notesModal.problemId}
                problemTitle={notesModal.title}
                isOpen={notesModal.isOpen}
                onClose={() => setNotesModal({ isOpen: false, problemId: "", title: "" })}
            />
        </motion.div>
    )
}

function StatsCard({ title, value, icon, highlight }: { title: string, value: string, icon: React.ReactNode, highlight?: boolean }) {
    return (
        <Card className={`hover-card transition-colors ${highlight ? "border-orange-500/50 bg-orange-500/5" : ""}`}>
            <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
                    {icon}
                </div>
                <span className="text-xl sm:text-2xl font-bold tracking-tight">{value}</span>
            </CardContent>
        </Card>
    )
}

function DifficultyBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{count}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

function MotivationalTip() {
    const { data: user } = useUser()

    const tip = useMemo(() => {
        if (!user?.id) return null
        return tipForUserTodayWithMix(user.id)
    }, [user?.id])

    if (!tip) return null

    return (
        <Card className="hover-card bg-gradient-to-br from-secondary/50 to-transparent border-dashed">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        {tip.mood === "pun" ? (
                            <Zap className="h-4 w-4 text-amber-500" />
                        ) : (
                            <Lightbulb className="h-4 w-4 text-primary" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Daily Tip</p>
                            {tip.mood === "pun" && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    Pun
                                </span>
                            )}
                        </div>
                        <p className="text-sm leading-relaxed text-white/90">{tip.text}</p>
                        {tip.tags && tip.tags.length > 0 && (
                            <div className="flex gap-1.5 mt-2">
                                {tip.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
