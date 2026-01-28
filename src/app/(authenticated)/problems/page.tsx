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
import { EmptyState } from "@/components/empty-state"

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
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All Problems</h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        {isLoading ? "Loading..." : `Tracking ${problems?.length || 0} questions`}
                    </p>
                </div>
                <Button asChild size="default" className="gap-2 w-full sm:w-auto">
                    <Link href="/add">
                        <Plus className="h-4 w-4" />
                        Add Problem
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
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
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <Card key={i} className="p-4">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-3" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </Card>
                    ))
                ) : filteredProblems && filteredProblems.length > 0 ? (
                    filteredProblems.map((problem: any) => (
                        <Link key={problem.id} href={`/problems/${problem.id}`}>
                            <Card className="p-4 hover:bg-muted/50 transition-colors active:scale-[0.99]">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{problem.title}</h3>
                                        <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                                            {problem.problemSlug || problem.leetcodeSlug}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`font-mono text-[10px] uppercase tracking-wider shrink-0 ${getDifficultyColor(problem.difficulty)}`}
                                    >
                                        {problem.difficulty}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                    <span>Review: {format(new Date(problem.nextReviewAt), "MMM d")}</span>
                                    <span>{problem.reviewCount} reviews</span>
                                </div>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="border border-dashed rounded-xl p-8 bg-muted/5">
                        <EmptyState
                            icon={Filter}
                            title="No problems found"
                            description="Try adjusting your search or filters, or add a new problem to your list."
                            action={{
                                label: "Add Problem",
                                href: "/add"
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <Card className="border-muted bg-card overflow-hidden hidden md:block">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50 sticky top-0 z-10 shadow-sm">
                                    <TableHead className="min-w-[200px] cursor-pointer select-none" onClick={() => handleSort("title")}>
                                        Problem
                                        {sortConfig.key === "title" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                    </TableHead>
                                    <TableHead className="w-[100px] cursor-pointer select-none" onClick={() => handleSort("difficulty")}>
                                        Difficulty
                                        {sortConfig.key === "difficulty" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                    </TableHead>
                                    <TableHead className="w-[120px] cursor-pointer select-none" onClick={() => handleSort("nextReviewAt")}>
                                        Next Review
                                        {sortConfig.key === "nextReviewAt" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                    </TableHead>
                                    <TableHead className="w-[80px] cursor-pointer select-none text-right" onClick={() => handleSort("reviewCount")}>
                                        Reviews
                                        {sortConfig.key === "reviewCount" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                    </TableHead>
                                    <TableHead className="w-[80px] text-right">Actions</TableHead>
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
                                                    <Link href={`/problems/${problem.id}`} className="font-medium hover:underline hover:text-primary transition-colors truncate max-w-[300px]">
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
                                                <div className="flex items-center justify-end gap-1">
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
                                        <TableCell colSpan={5} className="h-64">
                                            <EmptyState
                                                icon={Filter}
                                                title="No problems found"
                                                description="Try adjusting your search or filters, or add a new problem to your list."
                                                action={{
                                                    label: "Add Problem",
                                                    href: "/add"
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
