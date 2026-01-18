"use client"

import { useProblems, useReviewProblem } from "@/hooks/use-problems"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" // Fixed import
import { CheckCircle, ExternalLink, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"

export default function DashboardPage() {
    const { data: dueProblems, isLoading: loadingDue } = useProblems("due")
    const { data: solvedToday, isLoading: loadingSolved } = useProblems("solved-today")
    const { data: upcomingProblems, isLoading: loadingUpcoming } = useProblems("upcoming")
    const reviewMutation = useReviewProblem()

    const handleReview = (id: string) => {
        reviewMutation.mutate(id, {
            onSuccess: () => {
                toast.success("Problem marked as reviewed")
            },
            onError: () => {
                toast.error("Failed to mark as reviewed")
            }
        })
    }

    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case "easy": return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
            case "medium": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
            case "hard": return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            default: return "bg-slate-500/10 text-slate-500"
        }
    }

    return (
        <div className="container mx-auto space-y-8 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's what you need to focus on today.</p>
            </div>

            {/* Due for Revision */}
            <section>
                <h2 className="mb-4 text-2xl font-semibold tracking-tight">Due for Revision</h2>
                {loadingDue ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
                        ))}
                    </div>
                ) : dueProblems && dueProblems.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {dueProblems.map((problem) => (
                            <Card key={problem.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                                            {problem.difficulty}
                                        </Badge>
                                        <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                    <CardTitle className="line-clamp-1">{problem.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>Reviews: {problem.reviewCount}</p>
                                        <p>Last solved: {format(new Date(problem.lastSolvedAt), "MMM d, yyyy")}</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => handleReview(problem.id)} disabled={reviewMutation.isPending}>
                                        {reviewMutation.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        Mark as Re-solved
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed bg-muted/20">
                        <p className="text-muted-foreground">No problems due for revision today.</p>
                    </div>
                )}
            </section>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Solved Today */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold tracking-tight">Solved Today</h2>
                    {loadingSolved ? (
                        <div className="space-y-2">
                            {[1, 2].map((i) => <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />)}
                        </div>
                    ) : solvedToday && solvedToday.length > 0 ? (
                        <div className="space-y-2">
                            {solvedToday.map((problem) => (
                                <div key={problem.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                                        <span className="font-medium">{problem.title}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{format(new Date(problem.lastSolvedAt), "h:mm a")}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed bg-muted/20">
                            <p className="text-sm text-muted-foreground">No problems solved yet today. Go calculate!</p>
                        </div>
                    )}
                </section>

                {/* Upcoming */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold tracking-tight">Upcoming Revisions</h2>
                    {loadingUpcoming ? (
                        <div className="space-y-2">
                            {[1, 2].map((i) => <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />)}
                        </div>
                    ) : upcomingProblems && upcomingProblems.length > 0 ? (
                        <div className="space-y-2">
                            {upcomingProblems.slice(0, 5).map((problem) => (
                                <div key={problem.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{problem.title}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">Due: {format(new Date(problem.nextReviewAt), "MMM d")}</span>
                                </div>
                            ))}
                            {upcomingProblems.length > 5 && (
                                <Button variant="link" className="px-0 text-muted-foreground" asChild>
                                    <Link href="/problems">View all upcoming</Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed bg-muted/20">
                            <p className="text-sm text-muted-foreground">No upcoming revisions scheduled.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
