"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    ExternalLink,
    Calendar,
    Clock,
    FileText,
    Lightbulb,
    AlertTriangle,
    History,
    RotateCcw,
    Save,
    CheckCircle2,
    Brain,
    Zap
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"

interface Problem {
    id: string
    title: string
    difficulty: string
    url: string
    platform: string
    problemSlug: string
    notes: string | null
    solution: string | null
    firstSolvedAt: string
    lastSolvedAt: string
    nextReviewAt: string
    lastReviewedAt: string | null
    reviewCount: number
    interval: number
}

export default function ProblemDetailPage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const problemId = params.id as string

    const [notes, setNotes] = useState("")
    const [recallPrompts, setRecallPrompts] = useState("")
    const [pitfalls, setPitfalls] = useState("")
    const [solution, setSolution] = useState("")
    const [hasChanges, setHasChanges] = useState(false)

    // Fetch problem
    const { data: problem, isLoading, error } = useQuery<Problem>({
        queryKey: ["problem", problemId],
        queryFn: async () => {
            const res = await fetch(`/api/problems/${problemId}`)
            if (!res.ok) throw new Error("Failed to fetch problem")
            return res.json()
        },
    })

    // Parse notes into sections
    useEffect(() => {
        if (problem?.notes) {
            try {
                const parsed = JSON.parse(problem.notes)
                setNotes(parsed.notes || "")
                setRecallPrompts(parsed.recallPrompts || "")
                setPitfalls(parsed.pitfalls || "")
            } catch {
                // Legacy plain text notes
                setNotes(problem.notes || "")
            }
        }
        if (problem?.solution) {
            setSolution(problem.solution)
        }
    }, [problem])

    // Track changes
    useEffect(() => {
        if (!problem) return
        const currentNotes = problem.notes ? JSON.stringify({
            notes: notes,
            recallPrompts: recallPrompts,
            pitfalls: pitfalls
        }) : ""
        const originalNotes = problem.notes || ""

        try {
            const orig = JSON.parse(originalNotes)
            setHasChanges(
                notes !== (orig.notes || "") ||
                recallPrompts !== (orig.recallPrompts || "") ||
                pitfalls !== (orig.pitfalls || "") ||
                solution !== (problem.solution || "")
            )
        } catch {
            setHasChanges(notes !== originalNotes || solution !== (problem.solution || ""))
        }
    }, [notes, recallPrompts, pitfalls, solution, problem])

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            const notesData = JSON.stringify({
                notes,
                recallPrompts,
                pitfalls,
            })
            const res = await fetch(`/api/problems/${problemId}/notes`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: notesData, solution }),
            })
            if (!res.ok) throw new Error("Failed to save")
            return res.json()
        },
        onSuccess: () => {
            toast.success("Changes saved!")
            queryClient.invalidateQueries({ queryKey: ["problem", problemId] })
            setHasChanges(false)
        },
        onError: () => {
            toast.error("Failed to save changes")
        }
    })

    // Reset progress mutation
    const resetMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/problems/${problemId}/reset`, {
                method: "POST",
            })
            if (!res.ok) throw new Error("Failed to reset")
            return res.json()
        },
        onSuccess: () => {
            toast.success("Progress reset! Review scheduled for tomorrow.")
            queryClient.invalidateQueries({ queryKey: ["problem", problemId] })
        },
        onError: () => {
            toast.error("Failed to reset progress")
        }
    })

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20"
            case "hard": return "text-rose-500 bg-rose-500/10 border-rose-500/20"
            default: return "text-muted-foreground bg-secondary"
        }
    }

    const getPlatformName = (platform: string) => {
        const names: Record<string, string> = {
            leetcode: "LeetCode",
            codeforces: "Codeforces",
            atcoder: "AtCoder",
            codechef: "CodeChef",
        }
        return names[platform] || platform
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <Skeleton className="h-8 w-48 mb-6" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        )
    }

    if (error || !problem) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold mb-2">Problem not found</h1>
                    <p className="text-muted-foreground mb-6">This problem doesn't exist or you don't have access.</p>
                    <Button asChild>
                        <Link href="/problems">Back to Problems</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const nextReview = new Date(problem.nextReviewAt)
    const isOverdue = nextReview < new Date()

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Back Button */}
            <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                                {problem.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="font-mono text-xs">
                                {getPlatformName(problem.platform)}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold mb-1">{problem.title}</h1>
                        <p className="text-sm text-muted-foreground font-mono">{problem.problemSlug}</p>
                    </div>
                    <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Open Problem
                    </a>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <Brain className="h-4 w-4" />
                            Reviews
                        </div>
                        <p className="font-semibold">{problem.reviewCount}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <Clock className="h-4 w-4" />
                            Interval
                        </div>
                        <p className="font-semibold">{problem.interval} day{problem.interval !== 1 ? 's' : ''}</p>
                    </div>
                    <div className={cn("p-3 rounded-lg", isOverdue ? "bg-rose-500/10" : "bg-secondary/50")}>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <Calendar className="h-4 w-4" />
                            Next Review
                        </div>
                        <p className={cn("font-semibold", isOverdue && "text-rose-500")}>
                            {isOverdue ? "Overdue" : formatDistanceToNow(nextReview, { addSuffix: true })}
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <CheckCircle2 className="h-4 w-4" />
                            First Solved
                        </div>
                        <p className="font-semibold">{format(new Date(problem.firstSolvedAt), "MMM d, yyyy")}</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5" />
                                Your Notes
                            </CardTitle>
                            <CardDescription>
                                Key insights, approach, and things to remember
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add your notes about this problem..."
                                className="min-h-[120px] resize-none"
                            />
                        </CardContent>
                    </Card>

                    {/* Recall Prompts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                Recall Prompts
                            </CardTitle>
                            <CardDescription>
                                Questions to ask yourself: "What's the trick?", "Key insight?"
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={recallPrompts}
                                onChange={(e) => setRecallPrompts(e.target.value)}
                                placeholder="• What pattern does this use?&#10;• What's the key insight?&#10;• What's the time complexity?"
                                className="min-h-[100px] resize-none"
                            />
                        </CardContent>
                    </Card>

                    {/* Pitfalls */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <AlertTriangle className="h-5 w-5 text-rose-500" />
                                Pitfalls & Edge Cases
                            </CardTitle>
                            <CardDescription>
                                Common bugs and tricky cases to watch out for
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={pitfalls}
                                onChange={(e) => setPitfalls(e.target.value)}
                                placeholder="• Don't forget to handle empty input&#10;• Watch for integer overflow&#10;• Edge case: single element"
                                className="min-h-[100px] resize-none"
                            />
                        </CardContent>
                    </Card>

                    {/* Solution Outline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Zap className="h-5 w-5 text-primary" />
                                Solution Outline
                            </CardTitle>
                            <CardDescription>
                                Brief outline or pseudocode (not full solution)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                                placeholder="1. Sort the array&#10;2. Use two pointers&#10;3. ..."
                                className="min-h-[120px] font-mono text-sm resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Save Button */}
                    <Button
                        onClick={() => saveMutation.mutate()}
                        disabled={!hasChanges || saveMutation.isPending}
                        className="w-full"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>

                    {/* Review History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <History className="h-5 w-5" />
                                Review History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {problem.lastReviewedAt && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Last reviewed</span>
                                        <span>{formatDistanceToNow(new Date(problem.lastReviewedAt), { addSuffix: true })}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total reviews</span>
                                    <span className="font-medium">{problem.reviewCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Current interval</span>
                                    <span className="font-medium">{problem.interval} days</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Next review</span>
                                    <span className={cn("font-medium", isOverdue && "text-rose-500")}>
                                        {format(nextReview, "MMM d, yyyy")}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href="/review">
                                    <Brain className="h-4 w-4 mr-2" />
                                    Review Now
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-rose-500 hover:text-rose-500"
                                onClick={() => resetMutation.mutate()}
                                disabled={resetMutation.isPending}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                {resetMutation.isPending ? "Resetting..." : "Reset Progress"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
