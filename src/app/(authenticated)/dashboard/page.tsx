"use client"

import { useProblems, useReviewProblem, useUndoReview, useSync, useUser, useStats } from "@/hooks/use-problems"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Heatmap } from "@/components/heatmap"
import { DailyChallenge } from "@/components/daily-challenge"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { FriendsList } from "@/components/friends-list"
import { ProblemNotesModal } from "@/components/problem-notes-modal"
import { formatDistanceToNow } from "date-fns"
import { Brain, CheckCircle2, Calendar, RefreshCw, ArrowUpRight, Flame, TrendingUp, Trophy, Star, Zap, Lightbulb, FileText } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useMemo, useState } from "react"

export default function DashboardPage() {
    const { data: user } = useUser()
    const { data: stats, isLoading: statsLoading } = useStats()
    const { data: dueProblems, isLoading: dueLoading } = useProblems("due")
    const { data: upcoming, isLoading: upcomingLoading } = useProblems("upcoming")
    const { mutate: sync, isPending: syncing } = useSync()
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

    const totalDue = dueProblems?.length || 0

    return (
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {user?.name?.split(' ')[0] || 'Developer'}.
                    </p>
                </div>
                <div className="flex gap-2">
                    {user?.leetcodeUsername ? (
                        <Button onClick={() => sync()} disabled={syncing} variant="outline" className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                            {syncing ? "Syncing..." : "Sync LeetCode"}
                        </Button>
                    ) : (
                        <Button asChild variant="default">
                            <Link href="/profile">Connect LeetCode</Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Level & XP Card */}
            <Card className="mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <Star className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">Level {stats?.level || 1}</p>
                                <p className="text-sm text-muted-foreground">{stats?.xp || 0} XP total</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium">{Math.round(stats?.xpProgress || 0)}% to Level {(stats?.level || 1) + 1}</p>
                            <p className="text-xs text-muted-foreground">{stats?.xpForNextLevel ? stats.xpForNextLevel - (stats.xp || 0) : 500} XP needed</p>
                        </div>
                    </div>
                    <Progress value={stats?.xpProgress || 0} className="h-2" />
                </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatsCard
                    title="Total Problems"
                    value={statsLoading ? "-" : String(stats?.total || 0)}
                    icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
                />
                <StatsCard
                    title="Due Today"
                    value={dueLoading ? "-" : String(totalDue)}
                    icon={<Brain className="h-5 w-5 text-primary" />}
                />
                <StatsCard
                    title="Reviewed Today"
                    value={statsLoading ? "-" : String(stats?.reviewedToday || 0)}
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                />
                <StatsCard
                    title="Day Streak"
                    value={statsLoading ? "-" : String(stats?.streak || 0)}
                    icon={<Flame className="h-5 w-5 text-orange-500" />}
                    highlight={(stats?.streak ?? 0) > 0}
                />
            </div>

            {/* Achievements */}
            {stats?.achievements && stats.achievements.length > 0 && (
                <Card className="mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            Achievements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {stats.achievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-colors"
                                    title={achievement.description}
                                >
                                    <span className="text-xl">{achievement.emoji}</span>
                                    <span className="text-sm font-medium">{achievement.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Heatmap */}
            <Card className="mb-6">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Activity</CardTitle>
                    <CardDescription>Your review activity over the past year</CardDescription>
                </CardHeader>
                <CardContent>
                    {statsLoading ? (
                        <Skeleton className="h-32 w-full" />
                    ) : (
                        <Heatmap data={stats?.heatmapData || {}} />
                    )}
                </CardContent>
            </Card>

            {/* Difficulty Breakdown */}
            {stats && stats.total > 0 && (
                <Card className="mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Problem Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-6">
                            <DifficultyBar
                                label="Easy"
                                count={stats.easy}
                                total={stats.total}
                                color="bg-emerald-500"
                            />
                            <DifficultyBar
                                label="Medium"
                                count={stats.medium}
                                total={stats.total}
                                color="bg-amber-500"
                            />
                            <DifficultyBar
                                label="Hard"
                                count={stats.hard}
                                total={stats.total}
                                color="bg-rose-500"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Main List: Due Problems */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full border-muted">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-primary" />
                                Review Queue
                            </CardTitle>
                            <CardDescription>
                                Complete reviews to earn XP and level up
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dueLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                </div>
                            ) : dueProblems && dueProblems.length > 0 ? (
                                <div className="space-y-3">
                                    {dueProblems.map((problem: any) => (
                                        <div
                                            key={problem.id}
                                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:bg-secondary/50 hover:border-primary/20 transition-all duration-200"
                                        >
                                            <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <a
                                                        href={problem.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                                    >
                                                        {problem.title}
                                                        <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                                                    </a>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <Zap className="h-3 w-3 text-primary" />
                                                        +{getXpForDifficulty(problem.difficulty)} XP
                                                    </span>
                                                    <span className="text-border">|</span>
                                                    <span>Review #{problem.reviewCount + 1}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 sm:ml-4 w-full sm:w-auto">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setNotesModal({ isOpen: true, problemId: problem.id, title: problem.title })}
                                                    className="shrink-0"
                                                    title="Notes & Solution"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleReview(problem.id, problem.difficulty, problem.title)}
                                                    disabled={reviewing}
                                                    className="flex-1 sm:flex-initial"
                                                >
                                                    Mark Reviewed
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
                                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                                        <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg">All Caught Up!</h3>
                                    <p className="text-muted-foreground max-w-xs mt-1">
                                        No problems due for review. Great job!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Daily Challenge */}
                    {dueProblems && dueProblems.length > 0 && (
                        <DailyChallenge
                            problem={{
                                id: dueProblems[0].id,
                                title: dueProblems[0].title,
                                difficulty: dueProblems[0].difficulty,
                                url: dueProblems[0].url,
                            }}
                            onComplete={() => handleReview(dueProblems[0].id, dueProblems[0].difficulty, dueProblems[0].title)}
                        />
                    )}

                    {/* Upcoming Reviews */}
                    <Card>
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

                    {/* Motivational Tips */}
                    <MotivationalTip />

                    {/* Pomodoro Timer */}
                    <PomodoroTimer />

                    {/* Friends */}
                    <FriendsList />
                </div>
            </div>

            {/* Notes Modal */}
            <ProblemNotesModal
                problemId={notesModal.problemId}
                problemTitle={notesModal.title}
                isOpen={notesModal.isOpen}
                onClose={() => setNotesModal({ isOpen: false, problemId: "", title: "" })}
            />
        </div>
    )
}

function StatsCard({ title, value, icon, highlight }: { title: string, value: string, icon: React.ReactNode, highlight?: boolean }) {
    return (
        <Card className={highlight ? "border-orange-500/50 bg-orange-500/5" : ""}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
                    {icon}
                </div>
                <span className="text-2xl font-bold tracking-tight">{value}</span>
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

const TIPS = [
    "Consistency beats intensity. A little practice every day compounds!",
    "Focus on patterns, not just solutions. Patterns transfer to new problems.",
    "Review problems you struggled with first. That's where growth happens.",
    "Take breaks! Your brain consolidates learning during rest.",
    "Explain solutions out loud. If you can teach it, you understand it.",
    "Don't memorize code—understand the intuition behind each approach.",
    "Track your weak areas and prioritize them in reviews.",
]

function MotivationalTip() {
    const tipIndex = useMemo(() => {
        // Different tip each day
        const day = new Date().getDate()
        return day % TIPS.length
    }, [])

    return (
        <Card className="bg-gradient-to-br from-secondary/50 to-transparent border-dashed">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Lightbulb className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Daily Tip</p>
                        <p className="text-sm leading-relaxed">{TIPS[tipIndex]}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
