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
import { useEmberTrail } from "@/components/features/gamification/ember-trail-provider"
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
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined

    const { data: problems = [], isLoading } = useProblems("due", limit)
    const { data: stats } = useStats()
    const queryClient = useQueryClient()
    const { triggerReviewEmber } = useEmberTrail()

    const [currentIndex, setCurrentIndex] = useState(0)
    const [revealed, setRevealed] = useState(false)
    const [sessionComplete, setSessionComplete] = useState(false)
    const [sessionXp, setSessionXp] = useState(0)
    const [reviewedCount, setReviewedCount] = useState(0)

    // const problems = limit && allDueProblems ? allDueProblems.slice(0, limit) : (allDueProblems || [])
    // Direct from API now

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
        <div className="mx-auto px-4 w-full max-w-5xl min-h-[calc(100svh-100px)] flex flex-col pt-6 pb-2">
            {/* Header / Meta */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-6 mb-8 shrink-0"
            >
                <div className="space-y-2">
                    <p className="text-sm text-white/60">
                        Problem <span className="text-white/80 font-medium">{currentIndex + 1}</span> of{" "}
                        <span className="text-white/80 font-medium">{totalProblems}</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("rounded-full border px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider", getDifficultyColor(currentProblem.difficulty))}>
                            {currentProblem.difficulty}
                        </Badge>
                        <span className="text-xs text-white/20">•</span>
                        <span className="text-xs text-white/50">Review #{currentProblem.reviewCount + 1}</span>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-sm text-white/50 flex items-center justify-end gap-2 mb-1">
                        <Sparkles className="h-3 w-3 text-[#BB7331]" />
                        Session XP
                    </p>
                    <p className="text-3xl font-semibold text-white/90 leading-none tabular-nums">{sessionXp}</p>
                </div>
            </motion.header>

            {/* Progress Bar - Subtle */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-50 pointer-events-none"
            >
                <motion.div
                    className="h-full bg-[#BB7331] shadow-[0_0_10px_rgba(187,115,49,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex) / totalProblems) * 100}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </motion.div>

            {/* Main Card */}
            <div className="flex-1 flex flex-col min-h-0 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentProblem.id}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        className="flex-1 flex flex-col"
                    >
                        <Card className="flex-1 flex flex-col relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
                            {/* orange bloom */}
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(187,115,49,0.12),transparent_55%)]" />

                            <CardContent className="flex-1 flex flex-col justify-center p-8 sm:p-12 relative z-10 w-full max-w-4xl mx-auto">
                                {/* Title Block */}
                                <div className="mb-10 text-center">
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white/90 mb-4 leading-tight">
                                        {currentProblem.title}
                                    </h1>
                                    <a
                                        href={currentProblem.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[#BB7331] transition-colors py-1 px-3 rounded-full hover:bg-white/5"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        View on LeetCode
                                    </a>
                                </div>

                                {/* Interaction Area */}
                                <div className="min-h-[200px] flex flex-col justify-center items-center w-full">
                                    <AnimatePresence mode="wait">
                                        {!revealed ? (
                                            <motion.div
                                                key="reveal-state"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, y: 10, position: "absolute" }}
                                                className="flex flex-col items-center justify-center space-y-8"
                                            >
                                                <p className="text-lg sm:text-xl text-white/55 text-center max-w-lg mx-auto leading-relaxed font-light">
                                                    Take a moment. Can you recall the optimal solution and time complexity?
                                                </p>
                                                <Button
                                                    onClick={handleReveal}
                                                    className="
                                                        h-14 rounded-2xl px-8 font-medium text-base
                                                        bg-[#BB7331] text-black
                                                        hover:bg-[#BB7331]/90
                                                        hover:shadow-[0_0_0_4px_rgba(187,115,49,0.14)]
                                                        active:scale-[0.98]
                                                        transition-all duration-200
                                                    "
                                                >
                                                    Reveal Answer
                                                    <kbd className="ml-3 rounded-lg px-2 py-1 text-[10px] font-semibold bg-black/20 text-black/70 border border-black/10">
                                                        SPACE
                                                    </kbd>
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="rate-state"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="w-full max-w-2xl"
                                            >
                                                <div className="text-center mb-8">
                                                    <h3 className="text-lg font-medium text-white/90 mb-1">How clearly did you remember?</h3>
                                                    <p className="text-sm text-white/40">Be honest - this determines your review schedule.</p>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <RatingButton
                                                        rating="forgot"
                                                        label="Forgot"
                                                        subLabel="Review soon"
                                                        shortcut="1"
                                                        icon={XCircle}
                                                        color="text-rose-500"
                                                        iconBg="bg-rose-500/10"
                                                        borderColor="border-rose-500/20"
                                                        hoverColor="hover:border-rose-500/50 hover:bg-rose-500/5"
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
                                                        iconBg="bg-amber-500/10"
                                                        borderColor="border-amber-500/20"
                                                        hoverColor="hover:border-amber-500/50 hover:bg-amber-500/5"
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
                                                        iconBg="bg-emerald-500/10"
                                                        borderColor="border-emerald-500/20"
                                                        hoverColor="hover:border-emerald-500/50 hover:bg-emerald-500/5"
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
            </div>

            {/* Hint Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center shrink-0"
            >
                <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs text-white/60 backdrop-blur-md shadow-lg">
                    <span className="flex items-center gap-1.5 border-r border-white/10 pr-3 mr-1">
                        <kbd className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-white/70 min-w-[24px] text-center font-sans">Space</kbd>
                        <span>to reveal</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-white/70 min-w-[20px] text-center font-sans">1</kbd>
                        <kbd className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-white/70 min-w-[20px] text-center font-sans">2</kbd>
                        <kbd className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-white/70 min-w-[20px] text-center font-sans">3</kbd>
                        <span>to rate</span>
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
    iconBg,
    borderColor,
    hoverColor,
    onClick,
    disabled
}: {
    rating: string
    label: string
    subLabel: string
    shortcut: string
    icon: any
    color: string
    iconBg: string
    borderColor: string
    hoverColor: string
    onClick: () => void
    disabled: boolean
}) {
    return (
        <Button
            variant="outline"
            className={cn(
                "h-auto py-6 sm:py-8 flex flex-col gap-3 relative bg-white/[0.02] transition-all duration-200 group hover:scale-[1.02]",
                borderColor,
                hoverColor
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-100 transition-opacity">
                <kbd className="text-[10px] font-sans bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-white/70">{shortcut}</kbd>
            </div>

            <div className={cn("p-3 rounded-xl mb-1 transition-colors", iconBg, "group-hover:bg-opacity-80")}>
                <Icon className={cn("h-6 w-6", color)} />
            </div>

            <div className="space-y-0.5">
                <span className="block text-base sm:text-lg font-semibold text-white/90">{label}</span>
                <span className="block text-xs text-white/40 group-hover:text-white/60">{subLabel}</span>
            </div>
        </Button>
    )
}
