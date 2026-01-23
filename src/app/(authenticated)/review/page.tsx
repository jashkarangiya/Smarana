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

export default function ReviewPage() {
    const { data: dueProblems, isLoading } = useProblems("due")
    const { data: stats } = useStats()
    const queryClient = useQueryClient()

    const [currentIndex, setCurrentIndex] = useState(0)
    const [revealed, setRevealed] = useState(false)
    const [sessionComplete, setSessionComplete] = useState(false)
    const [sessionXp, setSessionXp] = useState(0)
    const [reviewedCount, setReviewedCount] = useState(0)

    const problems = dueProblems || []
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
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        )
    }

    // No problems due
    if (!isLoading && totalProblems === 0) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                        <Trophy className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">All caught up! 🎉</h1>
                    <p className="text-muted-foreground max-w-md mb-8">
                        You have no problems due for review today. Come back tomorrow or sync more problems.
                    </p>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Back to Dashboard</Link>
                        </Button>
                        <Button asChild>
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
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center mb-6 animate-pulse">
                        <Sparkles className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Session Complete! 🏆</h1>
                    <p className="text-muted-foreground max-w-md mb-4">
                        You reviewed {reviewedCount} problem{reviewedCount > 1 ? 's' : ''} and earned
                    </p>
                    <div className="flex items-center gap-2 text-4xl font-bold text-primary mb-8">
                        <Zap className="h-8 w-8" />
                        {sessionXp} XP
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Back to Dashboard</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/problems">View All Problems</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="h-6 w-6 text-primary" />
                        Review Session
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {totalProblems} due • ~{estimatedTime} min
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Session XP</p>
                        <p className="font-bold text-primary">{sessionXp}</p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{currentIndex + 1} / {totalProblems}</span>
                </div>
                <Progress value={((currentIndex) / totalProblems) * 100} className="h-2" />
            </div>

            {/* Problem Card */}
            <Card className="mb-6 overflow-hidden">
                <CardContent className="p-0">
                    {/* Problem Header */}
                    <div className="p-6 border-b">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                        variant="outline"
                                        className={`font-mono text-xs uppercase ${getDifficultyColor(currentProblem.difficulty)}`}
                                    >
                                        {currentProblem.difficulty}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        Review #{currentProblem.reviewCount + 1}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold mb-1">{currentProblem.title}</h2>
                                <p className="text-sm text-muted-foreground font-mono">{(currentProblem as any).problemSlug || (currentProblem as any).leetcodeSlug}</p>
                            </div>
                            <a
                                href={currentProblem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <ExternalLink className="h-5 w-5 text-muted-foreground" />
                            </a>
                        </div>
                    </div>

                    {/* Reveal / Rate Section */}
                    <div className="p-6">
                        {!revealed ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-6">
                                    Can you recall the approach and key insights?
                                </p>
                                <Button onClick={handleReveal} size="lg" className="gap-2">
                                    <Keyboard className="h-4 w-4" />
                                    Reveal (Space)
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground">
                                        How well did you remember this problem?
                                    </p>
                                </div>

                                {/* Rating Buttons */}
                                <div className="grid grid-cols-3 gap-3">
                                    <Button
                                        onClick={() => handleRate("remembered")}
                                        disabled={rateMutation.isPending}
                                        variant="outline"
                                        className={cn(
                                            "h-auto py-4 flex-col gap-2 border-2 transition-all",
                                            "hover:border-emerald-500 hover:bg-emerald-500/10"
                                        )}
                                    >
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        <span className="font-semibold">Remembered</span>
                                        <span className="text-xs text-muted-foreground">Press 1</span>
                                    </Button>
                                    <Button
                                        onClick={() => handleRate("kinda")}
                                        disabled={rateMutation.isPending}
                                        variant="outline"
                                        className={cn(
                                            "h-auto py-4 flex-col gap-2 border-2 transition-all",
                                            "hover:border-amber-500 hover:bg-amber-500/10"
                                        )}
                                    >
                                        <HelpCircle className="h-6 w-6 text-amber-500" />
                                        <span className="font-semibold">Kinda</span>
                                        <span className="text-xs text-muted-foreground">Press 2</span>
                                    </Button>
                                    <Button
                                        onClick={() => handleRate("forgot")}
                                        disabled={rateMutation.isPending}
                                        variant="outline"
                                        className={cn(
                                            "h-auto py-4 flex-col gap-2 border-2 transition-all",
                                            "hover:border-rose-500 hover:bg-rose-500/10"
                                        )}
                                    >
                                        <XCircle className="h-6 w-6 text-rose-500" />
                                        <span className="font-semibold">Forgot</span>
                                        <span className="text-xs text-muted-foreground">Press 3</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Keyboard Shortcuts Hint */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
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
