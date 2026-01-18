"use client"

import { useProblems } from "@/hooks/use-problems"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ExternalLink } from "lucide-react"

export default function ProblemsPage() {
    const { data: problems, isLoading } = useProblems("all")

    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case "easy": return "bg-green-500/10 text-green-500"
            case "medium": return "bg-yellow-500/10 text-yellow-500"
            case "hard": return "bg-red-500/10 text-red-500"
            default: return "bg-slate-500/10 text-slate-500"
        }
    }

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">All Problems</h1>
                <p className="text-muted-foreground">Manage your spaced repetition collection.</p>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Title</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Difficulty</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Last Solved</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Next Review</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center">Reviews</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Link</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4"><div className="h-4 w-32 bg-muted/50 animate-pulse rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-16 bg-muted/50 animate-pulse rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-muted/50 animate-pulse rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-muted/50 animate-pulse rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-8 mx-auto bg-muted/50 animate-pulse rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-4 ml-auto bg-muted/50 animate-pulse rounded" /></td>
                                    </tr>
                                ))
                            ) : problems && problems.length > 0 ? (
                                problems.map((problem) => (
                                    <tr key={problem.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 font-medium">{problem.title}</td>
                                        <td className="p-4">
                                            <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                                                {problem.difficulty}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{format(new Date(problem.lastSolvedAt), "MMM d, yyyy")}</td>
                                        <td className="p-4 text-muted-foreground">{format(new Date(problem.nextReviewAt), "MMM d, yyyy")}</td>
                                        <td className="p-4 text-center">{problem.reviewCount}</td>
                                        <td className="p-4 text-right">
                                            <a href={problem.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No problems tracked yet. Go to your Profile to sync.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
