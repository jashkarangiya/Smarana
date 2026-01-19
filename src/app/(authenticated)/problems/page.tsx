"use client"

import { useProblems } from "@/hooks/use-problems"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { ExternalLink, Search, Filter } from "lucide-react"
import { useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ProblemsPage() {
    const { data: problems, isLoading } = useProblems("all")
    const [search, setSearch] = useState("")
    const [difficultyFilter, setDifficultyFilter] = useState("all")

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20"
            case "hard": return "text-rose-500 bg-rose-500/10 border-rose-500/20"
            default: return "text-muted-foreground bg-secondary"
        }
    }

    const filteredProblems = problems?.filter((p: any) => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
        const matchesDifficulty = difficultyFilter === "all" || p.difficulty.toLowerCase() === difficultyFilter
        return matchesSearch && matchesDifficulty
    })

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Problems</h1>
                    <p className="text-muted-foreground mt-1">
                        {isLoading ? "Loading..." : `Tracking ${problems?.length || 0} questions`}
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title..."
                        className="pl-10 bg-card"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-card">
                        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="border-muted bg-card">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : filteredProblems && filteredProblems.length > 0 ? (
                        <div className="divide-y divide-border">
                            {filteredProblems.map((problem: any) => (
                                <div
                                    key={problem.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-secondary/50 transition-all duration-200 group"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-3 mb-1">
                                            <a
                                                href={problem.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold text-foreground hover:text-primary truncate flex items-center gap-1.5"
                                            >
                                                {problem.title}
                                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                            </a>
                                            <Badge
                                                variant="outline"
                                                className={`font-mono text-[10px] uppercase tracking-wider h-5 ${getDifficultyColor(problem.difficulty)}`}
                                            >
                                                {problem.difficulty}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {problem.leetcodeSlug}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6 mt-3 sm:mt-0 text-sm text-muted-foreground">
                                        <div className="hidden sm:block text-right">
                                            <p className="text-foreground font-medium">Next Review</p>
                                            <p>{format(new Date(problem.nextReviewAt), "MMM d, yyyy")}</p>
                                        </div>
                                        <div className="flex flex-col items-center min-w-[3rem]">
                                            <span className="text-lg font-bold text-foreground">{problem.reviewCount}</span>
                                            <span className="text-[10px] uppercase tracking-wide">Reviews</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                                <Search className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg">No problems found</h3>
                            <p className="text-muted-foreground mt-1">
                                {search ? "Try adjusting your search or filters" : "Connect LeetCode to sync problems"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
