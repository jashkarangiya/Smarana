"use client"

import { useState, useEffect, useCallback } from "react"
import { useProblems, useStats } from "@/hooks/use-problems"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Brain,
    CheckCircle2,
    HelpCircle,
    XCircle,
    ExternalLink,
    Keyboard,
    Sparkles,
    Trophy,
    ArrowRight,
    Clock,
    Zap
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useEmberTrail } from "@/components/ember-trail-provider"
import { getTrailLevel } from "@/lib/easter-egg"

type Rating = "remembered" | "kinda" | "forgot"

interface RateResponse {
    success: boolean
    xpReward: number
    newXp: number
    newLevel: number
    leveledUp: boolean
    newInterval: number
    nextReviewAt: string
}

import { useSearchParams } from "next/navigation"

export default function ReviewPage() {
    const searchParams = useSearchParams()
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : null

    const { data: allDueProblems, isLoading } = useProblems("due")
    const { data: stats } = useStats()
    const queryClient = useQueryClient()
    const { triggerReviewEmber } = useEmberTrail()

    const [currentIndex, setCurrentIndex] = useState(0)
    const [revealed, setRevealed] = useState(false)
    const [sessionComplete, setSessionComplete] = useState(false)
    const [sessionXp, setSessionXp] = useState(0)
    const [reviewedCount, setReviewedCount] = useState(0)

    const problems = limit && allDueProblems ? allDueProblems.slice(0, limit) : (allDueProblems || [])
    const currentProblem = problems[currentIndex]
    const totalProblems = problems.length
    const estimatedTime = Math.ceil(totalProblems * 2) // ~2 min per problem

    // Rate mutation
    const rateMutation = useMutation({
        mutationFn: async ({ problemId, rating }: { problemId: string; rating: Rating }) => {
            const res = await fetch(`/api/problems/${problemId}/rate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating }),
            })
            if (!res.ok) throw new Error("Failed to rate")
            return res.json() as Promise<RateResponse>
        },
        onSuccess: (data) => {
            setSessionXp(prev => prev + data.xpReward)
            setReviewedCount(prev => prev + 1)

            // Show XP toast
            toast.success(`+${data.xpReward} XP`, {
                description: data.leveledUp
                    ? `🎉 Level Up! You're now Level ${data.newLevel}!`
                    : `Next review in ${data.newInterval} day${data.newInterval > 1 ? 's' : ''}`
            })

            // Move to next problem
            if (currentIndex + 1 < totalProblems) {
                setCurrentIndex(prev => prev + 1)
                setRevealed(false)
            } else {
                setSessionComplete(true)
                // Trigger Node 3 easter egg after completing a review session
                // Only triggers if user is at level 2 (has found Profile Ember)
                if (getTrailLevel() === 2) {
                    triggerReviewEmber()
                }
            }

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ["problems"] })
            queryClient.invalidateQueries({ queryKey: ["stats"] })
        },
        onError: () => {
            toast.error("Failed to rate problem")
        }
    })

    const handleRate = useCallback((rating: Rating) => {
        if (!currentProblem || rateMutation.isPending) return
        rateMutation.mutate({ problemId: currentProblem.id, rating })
    }, [currentProblem, rateMutation])

    const handleReveal = useCallback(() => {
        setRevealed(true)
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            if (e.code === "Space" && !revealed) {
                e.preventDefault()
                handleReveal()
            } else if (revealed && !rateMutation.isPending) {
                if (e.key === "1") handleRate("remembered")
                else if (e.key === "2") handleRate("kinda")
                else if (e.key === "3") handleRate("forgot")
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [revealed, handleReveal, handleRate, rateMutation.isPending])

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20"
            case "hard": return "text-rose-500 bg-rose-500/10 border-rose-500/20"
            default: return "text-muted-foreground bg-secondary"
        }
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        )
    }

    // No problems due
    if (!isLoading && totalProblems === 0) {
        return (
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 sm:mb-6">
                        <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">All caught up!</h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-6 sm:mb-8">
                        You have no problems due for review today. Come back tomorrow or sync more problems.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                            <Link href="/dashboard">Back to Dashboard</Link>
                        </Button>
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/problems">View All Problems</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Session complete
    if (sessionComplete) {
        return (
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center mb-4 sm:mb-6 animate-pulse">
                        <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Session Complete!</h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-3 sm:mb-4">
                        You reviewed {reviewedCount} problem{reviewedCount > 1 ? 's' : ''} and earned
                    </p>
                    <div className="flex items-center gap-2 text-3xl sm:text-4xl font-bold text-primary mb-6 sm:mb-8">
                        <Zap className="h-6 w-6 sm:h-8 sm:w-8" />
                        {sessionXp} XP
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                            <Link href="/dashboard">Back to Dashboard</Link>
                        </Button>
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/problems">View All Problems</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        Review Session
                    </h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                        {totalProblems} due • ~{estimatedTime} min
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs sm:text-sm text-muted-foreground">Session XP</p>
                        <p className="font-bold text-primary">{sessionXp}</p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{currentIndex + 1} / {totalProblems}</span>
                </div>
                <Progress value={((currentIndex) / totalProblems) * 100} className="h-2" />
            </div>

            {/* Problem Card */}
            <Card className="mb-4 sm:mb-6 overflow-hidden">
                <CardContent className="p-0">
                    {/* Problem Header */}
                    <div className="p-4 sm:p-6 border-b">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Badge
                                        variant="outline"
                                        className={`font-mono text-[10px] sm:text-xs uppercase ${getDifficultyColor(currentProblem.difficulty)}`}
                                    >
                                        {currentProblem.difficulty}
                                    </Badge>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                                        Review #{currentProblem.reviewCount + 1}
                                    </span>
                                </div>
                                <h2 className="text-lg sm:text-xl font-semibold mb-1 break-words">{currentProblem.title}</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate">{(currentProblem as any).problemSlug || (currentProblem as any).leetcodeSlug}</p>
                            </div>
                            <a
                                href={currentProblem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                            >
                                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            </a>
                        </div>
                    </div>

                    {/* Reveal / Rate Section */}
                    <div className="p-4 sm:p-6">
                        {!revealed ? (
                            <div className="text-center py-6 sm:py-8">
                                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                                    Can you recall the approach and key insights?
                                </p>
                                <Button onClick={handleReveal} size="lg" className="gap-2 w-full sm:w-auto">
                                    <Keyboard className="h-4 w-4" />
                                    Reveal <span className="hidden sm:inline">(Space)</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 sm:space-y-6">
                                <div className="text-center py-2 sm:py-4">
                                    <p className="text-sm sm:text-base text-muted-foreground">
                                        How well did you remember this problem?
                                    </p>
                                </div>

                                {/* Rating Buttons */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    <Button
                                        onClick={() => handleRate("remembered")}
                                        disabled={rateMutation.isPending}
                                        variant="outline"
                                        className={cn(
                                            "h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2 border-2 transition-all",
                                            "hover:border-emerald-500 hover:bg-emerald-500/10 active:scale-[0.98]"
                                        )}
                                    >
                                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                                        <span className="font-semibold text-xs sm:text-sm">Remembered</span>
                                        <span className="hidden sm:block text-xs text-muted-foreground">Press 1</span>
                                    </Button>
                                    <Button
                                        onClick={() => handleRate("kinda")}
                                        disabled={rateMutation.isPending}
                                        variant="outline"
                                        className={cn(
                                            "h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2 border-2 transition-all",
                                            "hover:border-amber-500 hover:bg-amber-500/10 active:scale-[0.98]"
                                        )}
                                    >
                                        <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
                                        <span className="font-semibold text-xs sm:text-sm">Kinda</span>
                                        <span className="hidden sm:block text-xs text-muted-foreground">Press 2</span>
                                    </Button>
                                    <Button
                                        onClick={() => handleRate("forgot")}
                                        disabled={rateMutation.isPending}
                                        variant="outline"
                                        className={cn(
                                            "h-auto py-3 sm:py-4 flex-col gap-1 sm:gap-2 border-2 transition-all",
                                            "hover:border-rose-500 hover:bg-rose-500/10 active:scale-[0.98]"
                                        )}
                                    >
                                        <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500" />
                                        <span className="font-semibold text-xs sm:text-sm">Forgot</span>
                                        <span className="hidden sm:block text-xs text-muted-foreground">Press 3</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Keyboard Shortcuts Hint - Hide on mobile */}
            <div className="hidden sm:flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Space</kbd>
                    Reveal
                </span>
                <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">1</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">2</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">3</kbd>
                    Rate
                </span>
            </div>
        </div>
    )
}
