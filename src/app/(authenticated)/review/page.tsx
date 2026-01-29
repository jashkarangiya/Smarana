"use client"

import { useState, useEffect, useCallback } from "react"
import { useProblems, useStats } from "@/hooks/use-problems"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Link as LinkIcon, ExternalLink, Keyboard, Sparkles, Trophy, ArrowRight, Clock, Zap, CheckCircle2, HelpCircle, XCircle, Brain } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useEmberTrail } from "@/components/ember-trail-provider"
import { getTrailLevel } from "@/lib/easter-egg"
import { AnimatePresence, motion } from "framer-motion"

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
        <div className="container mx-auto px-4 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center max-w-2xl relative">
            {/* Header / Meta */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mb-8 flex items-end justify-between"
            >
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Problem {currentIndex + 1} of {totalProblems}</p>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs font-mono uppercase tracking-wider", getDifficultyColor(currentProblem.difficulty))}>
                            {currentProblem.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground/50">•</span>
                        <span className="text-xs text-muted-foreground">Review #{currentProblem.reviewCount + 1}</span>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 justify-end">
                        <Sparkles className="h-3 w-3 text-[#BB7331]" />
                        Session XP
                    </div>
                    <div className="text-2xl font-bold text-foreground tabular-nums leading-none">
                        {sessionXp}
                    </div>
                </div>
            </motion.div>

            {/* Progress Bar - Subtle */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50"
            >
                <motion.div
                    className="h-full bg-[#BB7331]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex) / totalProblems) * 100}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </motion.div>

            {/* Main Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentProblem.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    className="w-full"
                >
                    <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
                        {/* Card Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                        <CardContent className="p-8 sm:p-10 relative z-10">
                            {/* Title Block */}
                            <div className="mb-8 text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                                    {currentProblem.title}
                                </h1>
                                <a
                                    href={currentProblem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#BB7331] transition-colors"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    View on LeetCode
                                </a>
                            </div>

                            {/* Interaction Area */}
                            <div className="min-h-[200px] flex flex-col justify-center">
                                <AnimatePresence mode="wait">
                                    {!revealed ? (
                                        <motion.div
                                            key="reveal-state"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="flex flex-col items-center justify-center space-y-6"
                                        >
                                            <p className="text-lg text-white/60 text-center max-w-md mx-auto">
                                                Take a moment. Can you recall the optimal solution and time complexity?
                                            </p>
                                            <Button
                                                onClick={handleReveal}
                                                size="lg"
                                                className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95"
                                            >
                                                <span className="mr-2">Reveal Answer</span>
                                                <kbd className="hidden sm:inline-flex h-6 px-2 bg-black/10 rounded text-[10px] items-center text-black/60 font-sans border border-black/5">SPACE</kbd>
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="rate-state"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-full"
                                        >
                                            <div className="text-center mb-8">
                                                <h3 className="text-xl font-medium text-white mb-2">How clearly did you remember?</h3>
                                                <p className="text-sm text-white/40">Be honest - this schedules your next review.</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <RatingButton
                                                    rating="forgot"
                                                    label="Forgot"
                                                    subLabel="Review soon"
                                                    shortcut="1"
                                                    icon={XCircle}
                                                    color="text-rose-500"
                                                    bgHover="hover:bg-rose-500/10"
                                                    borderHover="hover:border-rose-500/50"
                                                    onClick={() => handleRate("forgot")}
                                                    disabled={rateMutation.isPending}
                                                />
                                                <RatingButton
                                                    rating="kinda"
                                                    label="Fuzzy"
                                                    subLabel="Review later"
                                                    shortcut="2"
                                                    icon={HelpCircle}
                                                    color="text-amber-500"
                                                    bgHover="hover:bg-amber-500/10"
                                                    borderHover="hover:border-amber-500/50"
                                                    onClick={() => handleRate("kinda")}
                                                    disabled={rateMutation.isPending}
                                                />
                                                <RatingButton
                                                    rating="remembered"
                                                    label="Easy"
                                                    subLabel="Review in days"
                                                    shortcut="3"
                                                    icon={CheckCircle2}
                                                    color="text-emerald-500"
                                                    bgHover="hover:bg-emerald-500/10"
                                                    borderHover="hover:border-emerald-500/50"
                                                    onClick={() => handleRate("remembered")}
                                                    disabled={rateMutation.isPending}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Hint Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
            >
                <div className="inline-flex items-center gap-6 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs text-white/30">
                    <span className="flex items-center gap-1.5">
                        <kbd className="font-sans bg-white/10 px-1.5 py-0.5 rounded text-white/70 min-w-[20px] text-center">Space</kbd> to reveal
                    </span>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="flex items-center gap-1.5">
                        <kbd className="font-sans bg-white/10 px-1.5 py-0.5 rounded text-white/70 min-w-[20px] text-center">1</kbd>
                        <kbd className="font-sans bg-white/10 px-1.5 py-0.5 rounded text-white/70 min-w-[20px] text-center">2</kbd>
                        <kbd className="font-sans bg-white/10 px-1.5 py-0.5 rounded text-white/70 min-w-[20px] text-center">3</kbd>
                        to rate
                    </span>
                </div>
            </motion.div>
        </div>
    )
}

function RatingButton({
    rating,
    label,
    subLabel,
    shortcut,
    icon: Icon,
    color,
    bgHover,
    borderHover,
    onClick,
    disabled
}: {
    rating: string
    label: string
    subLabel: string
    shortcut: string
    icon: any
    color: string
    bgHover: string
    borderHover: string
    onClick: () => void
    disabled: boolean
}) {
    return (
        <Button
            variant="outline"
            className={cn(
                "h-auto py-6 sm:py-8 flex flex-col gap-3 relative border-white/10 bg-white/[0.02] transition-all duration-200 group hover:scale-[1.02]",
                bgHover,
                borderHover
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-100 transition-opacity">
                <kbd className="text-[10px] font-sans bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-white/70">{shortcut}</kbd>
            </div>
            <Icon className={cn("h-8 w-8 mb-1", color)} />
            <div className="space-y-0.5">
                <span className="block text-base sm:text-lg font-semibold text-white">{label}</span>
                <span className="block text-xs text-white/40 group-hover:text-white/60">{subLabel}</span>
            </div>
        </Button>
    )
}
