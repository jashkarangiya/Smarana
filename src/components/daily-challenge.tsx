"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flame, Clock, Zap, Gift, ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"

interface DailyChallengeProps {
    problem?: {
        id: string
        title: string
        difficulty: string
        url: string
    }
    onComplete?: () => void
    isCompleted?: boolean
}

export function DailyChallenge({ problem, onComplete, isCompleted = false }: DailyChallengeProps) {
    const [timeLeft, setTimeLeft] = useState("")

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date()
            const tomorrow = new Date(now)
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(0, 0, 0, 0)

            const diff = tomorrow.getTime() - now.getTime()
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeLeft(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [])

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case "easy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
            case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/30"
            case "hard": return "text-rose-500 bg-rose-500/10 border-rose-500/30"
            default: return "text-muted-foreground bg-secondary"
        }
    }

    const getBonusXp = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case "easy": return 20
            case "medium": return 50
            case "hard": return 100
            default: return 20
        }
    }

    if (!problem) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                    <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No daily challenge available</p>
                    <p className="text-xs mt-1">Check back tomorrow!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={`relative overflow-hidden transition-all duration-300 ${isCompleted ? "border-emerald-500/50 bg-emerald-500/5" : "border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5"}`}>
            {/* Shimmer effect */}
            {!isCompleted && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />
            )}

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/20">
                            <Flame className="h-4 w-4 text-primary" />
                        </div>
                        Daily Challenge
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-mono">{timeLeft}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold hover:text-primary transition-colors flex items-center gap-1 group"
                        >
                            {problem.title}
                            <ArrowUpRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center gap-1 text-primary">
                            <Zap className="h-4 w-4" />
                            <span className="font-bold">+{getBonusXp(problem.difficulty)}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">BONUS XP</span>
                    </div>
                </div>

                {isCompleted ? (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-500/10 text-emerald-500 font-medium">
                        <span className="text-lg">🎉</span>
                        Challenge Completed!
                    </div>
                ) : (
                    <Button onClick={onComplete} className="w-full" size="lg">
                        Complete Challenge
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
