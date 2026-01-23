"use client"

import { useProblems } from "@/hooks/use-problems"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ExternalLink, Search, Filter, Plus } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useMemo, useState } from "react"
import Link from "next/link"
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
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "nextReviewAt", direction: "asc" })

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20"
            case "hard": return "text-rose-500 bg-rose-500/10 border-rose-500/20"
            default: return "text-muted-foreground bg-secondary"
        }
    }

    const sortData = (data: any[]) => {
        if (!sortConfig.key) return data

        return [...data].sort((a, b) => {
            let aValue = a[sortConfig.key]
            let bValue = b[sortConfig.key]

            // Handle dates
            if (sortConfig.key === "nextReviewAt" || sortConfig.key === "lastSolvedAt") {
                aValue = new Date(aValue).getTime()
                bValue = new Date(bValue).getTime()
            }

            // Handle difficulty (custom order)
            if (sortConfig.key === "difficulty") {
                const order = { easy: 1, medium: 2, hard: 3 }
                aValue = order[aValue.toLowerCase() as keyof typeof order] || 0
                bValue = order[bValue.toLowerCase() as keyof typeof order] || 0
            }

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
            return 0
        })
    }

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
        }))
    }

    const filteredProblems = useMemo(() => {
        if (!problems) return []
        let result = problems.filter((p: any) => {
            const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
            const matchesDifficulty = difficultyFilter === "all" || p.difficulty.toLowerCase() === difficultyFilter
            return matchesSearch && matchesDifficulty
        })
        return sortData(result)
    }, [problems, search, difficultyFilter, sortConfig])

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
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
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] bg-card">
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
                    <Button asChild size="default" className="gap-2 shrink-0">
                        <Link href="/add">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Problem</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="border-muted bg-card overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50 sticky top-0 z-10 shadow-sm">
                                <TableHead className="w-[40%] cursor-pointer select-none" onClick={() => handleSort("title")}>
                                    Problem
                                    {sortConfig.key === "title" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("difficulty")}>
                                    Difficulty
                                    {sortConfig.key === "difficulty" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("nextReviewAt")}>
                                    Next Review
                                    {sortConfig.key === "nextReviewAt" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort("reviewCount")}>
                                    Reviews
                                    {sortConfig.key === "reviewCount" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                </TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-8 float-right" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 float-right" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredProblems && filteredProblems.length > 0 ? (
                                filteredProblems.map((problem: any) => (
                                    <TableRow key={problem.id} className="group hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <Link href={`/problems/${problem.id}`} className="font-medium hover:underline hover:text-primary transition-colors truncate">
                                                    {problem.title}
                                                </Link>
                                                <span className="text-xs text-muted-foreground font-mono">{problem.problemSlug || problem.leetcodeSlug}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`font-mono text-[10px] uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}
                                            >
                                                {problem.difficulty}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-xs">
                                            {format(new Date(problem.nextReviewAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">
                                            {problem.reviewCount}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                    <a href={problem.url} target="_blank" rel="noreferrer" title="Open in LeetCode">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                    <Link href={`/problems/${problem.id}`} title="View Details">
                                                        <Search className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No problems found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
