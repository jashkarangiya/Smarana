
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, ArrowUpRight, Zap, FileText } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Problem {
    id: string
    title: string
    difficulty: string
    url: string
    reviewCount: number
}

interface ReviewQueueCardProps {
    problems: Problem[]
    isLoading: boolean
    onReview: (id: string, difficulty: string, title: string) => void
    onNotes: (id: string, title: string) => void
    isReviewing?: boolean
    className?: string
}

export function ReviewQueueCard({
    problems,
    isLoading,
    onReview,
    onNotes,
    isReviewing = false,
    className
}: ReviewQueueCardProps) {
    const dueCount = problems?.length || 0

    // Helper for difficulty colors (could be shared, but inlined for now for isolation)
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

    return (
        <Card className={cn("h-[600px] flex flex-col overflow-hidden border-muted bg-card/50 hover-card", className)}>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 shrink-0">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            Review Queue
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            <span className={cn("font-medium", dueCount > 0 ? "text-foreground" : "")}>{dueCount}</span> problems due for review
                        </p>
                    </div>
                    <Button variant="ghost" className="text-[#BB7331] hover:text-[#BB7331] hover:bg-[#BB7331]/10 h-8 text-xs" asChild>
                        <Link href="/review">View all →</Link>
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-3 px-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" />
                        ))}
                    </div>
                ) : problems && problems.length > 0 ? (
                    <div className="space-y-1">
                        {problems.map((p) => (
                            <div
                                key={p.id}
                                className="w-full rounded-xl px-4 py-3 text-left transition-all
                                         hover:bg-white/[0.04] group relative
                                         border border-transparent hover:border-white/5"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <a
                                                href={p.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="truncate font-medium hover:text-primary transition-colors flex items-center gap-1.5"
                                            >
                                                {p.title}
                                                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                            </a>
                                            <span className={cn("px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border", getDifficultyColor(p.difficulty))}>
                                                {p.difficulty}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Zap className="h-3 w-3 text-primary/70" />
                                                +{getXpForDifficulty(p.difficulty)} XP
                                            </span>
                                            <span className="text-border/40">•</span>
                                            <span>Review #{p.reviewCount + 1}</span>
                                        </div>
                                    </div>

                                    {/* Actions that appear on hover/focus, or always visible on mobile if needed */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                onNotes(p.id, p.title)
                                            }}
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            title="Notes"
                                        >
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                onReview(p.id, p.difficulty, p.title)
                                            }}
                                            disabled={isReviewing}
                                            size="sm"
                                            className="h-8 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                                        >
                                            Mark as Reviewed
                                        </Button>
                                    </div>

                                    {/* Default state indicator (arrow) when not hovering */}
                                    <div className="shrink-0 text-muted-foreground/30 group-hover:hidden md:flex hidden">
                                        {/* Placeholder to keep layout stable if needed, or just hidden */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                        <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                            <Brain className="h-6 w-6 opacity-50" />
                        </div>
                        <p>All caught up!</p>
                    </div>
                )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 border-t border-white/5 bg-black/40 backdrop-blur-md px-6 py-4 shrink-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground hidden sm:block">
                        Due: <span className="text-foreground font-medium">{dueCount}</span>
                        <span className="mx-2 opacity-20">•</span>
                        Est: <span className="text-foreground font-medium">{Math.ceil(dueCount * 2.5)} min</span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        {dueCount > 0 ? (
                            <>
                                <Button variant="secondary" className="flex-1 sm:flex-none border-white/10 hover:bg-white/10" asChild>
                                    <Link href="/review?limit=5">Quick 5</Link>
                                </Button>
                                <Button className="flex-1 sm:flex-none bg-[#BB7331] hover:bg-[#BB7331]/90 text-black font-medium" asChild>
                                    <Link href="/review">Start Session</Link>
                                </Button>
                            </>
                        ) : (
                            <Button variant="secondary" className="w-full" asChild>
                                <Link href="/problems">Browse Problems</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}
