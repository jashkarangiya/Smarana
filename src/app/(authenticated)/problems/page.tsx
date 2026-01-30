"use client"

import { useProblems } from "@/hooks/use-problems"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format, isBefore, endOfDay } from "date-fns"
import { ExternalLink, Search, Filter, Plus, ArrowUpRight, CheckCircle2 } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { EmptyState } from "@/components/empty-state"
import { cn } from "@/lib/utils"
// New imports
import { ProblemsFilterDialog } from "@/components/problems-filter-dialog"
import { FilterGroup, FilterRule } from "@/types/filters"

const DEFAULT_FILTERS: FilterGroup = {
    join: "and",
    rules: []
}

export default function ProblemsPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Filter State
    const [filterGroup, setFilterGroup] = useState<FilterGroup>(DEFAULT_FILTERS)

    // Derived: encoded filters for API
    const encodedFilters = useMemo(() => {
        if (filterGroup.rules.length === 0) return undefined
        return btoa(JSON.stringify(filterGroup))
    }, [filterGroup])

    // Fetch data using the advanced filters
    // Passing undefined for 'filter' (legacy) and 'limit', and passing encodedFilters as 3rd arg
    const { data: problems, isLoading } = useProblems(undefined, undefined, encodedFilters)

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "nextReviewAt", direction: "asc" })

    // Initialize from URL (legacy support or deep linking)
    useEffect(() => {
        const filtersParam = searchParams.get("filters")
        const filterParam = searchParams.get("filter")

        if (filtersParam) {
            try {
                const parsed = JSON.parse(atob(filtersParam))
                setFilterGroup(parsed)
            } catch (e) { console.error("Failed to parse URL filters") }
        } else if (filterParam === "due") {
            // Convert legacy "due" to new filter system
            setFilterGroup({
                join: "and",
                rules: [{ id: "init-due", field: "reviewState", op: "is", value: "PENDING" }]
            })
        }
    }, [])

    // Update URL when filters change (debounced or on apply? The dialog handles 'Apply', so we just sync state here)
    const handleMainApply = () => {
        // This is called when Dialog "Apply" is clicked.
        // We update the URL to be shareable
        const params = new URLSearchParams(searchParams.toString())
        if (filterGroup.rules.length > 0) {
            const b64 = btoa(JSON.stringify(filterGroup))
            params.set("filters", b64)
            params.delete("filter") // remove legacy
        } else {
            params.delete("filters")
        }
        router.push(`/problems?${params.toString()}`)
    }

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

    // Client-side sorting of the server-filtered results
    const sortedProblems = useMemo(() => {
        if (!problems) return []
        return sortData(problems)
    }, [problems, sortConfig])

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Problems Library</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isLoading ? "Loading..." : `Tracking ${problems?.length || 0} questions`}
                    </p>
                </div>
                <Button asChild size="default" className="gap-2 w-full sm:w-auto shadow-lg bg-[#BB7331] hover:bg-[#BB7331]/90 text-black font-medium">
                    <Link href="/add">
                        <Plus className="h-4 w-4" />
                        Add Problem
                    </Link>
                </Button>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 w-full">
                    <ProblemsFilterDialog
                        value={filterGroup}
                        onChange={setFilterGroup}
                        onApply={handleMainApply}
                        onReset={() => {
                            setFilterGroup(DEFAULT_FILTERS)
                            router.push("/problems")
                        }}
                        className="w-auto"
                    />

                    {/* Active Filter Chips */}
                    {filterGroup.rules.length > 0 && (
                        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {filterGroup.rules.map(rule => (
                                <Badge key={rule.id} variant="secondary" className="px-2 py-1 gap-1 font-normal bg-white/5 border-white/10 text-white/80 shrink-0">
                                    <span className="text-[#BB7331] font-medium capitalization">{rule.field.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-white/40">{rule.op === "is" ? ":" : rule.op.replace("_", " ")}</span>
                                    <span className="truncate max-w-[100px] block">{String(rule.value)}</span>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <Card className="border-muted bg-card overflow-hidden min-h-[400px]">
                <CardContent className="p-0">
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        {isLoading ? (
                            <div className="p-4 space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : sortedProblems && sortedProblems.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {sortedProblems.map((problem: any) => (
                                    <Link key={problem.id} href={`/problems/${problem.id}`} className="block">
                                        <div className="p-4 hover:bg-muted/50 transition-colors active:scale-[0.99]">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium truncate text-sm">{problem.title}</h3>
                                                    <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
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
                                                <span className={cn(
                                                    "flex items-center gap-1.5",
                                                    isBefore(new Date(problem.nextReviewAt), endOfDay(new Date())) ? "text-[#BB7331] font-medium" : ""
                                                )}>
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {format(new Date(problem.nextReviewAt), "MMM d")}
                                                </span>
                                                <span>{problem.reviewCount} reviews</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8">
                                <EmptyState
                                    icon={Filter}
                                    title="No problems found"
                                    description="Try adjusting your filters."
                                    action={{
                                        label: "Reset Filters",
                                        href: "/problems"
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="overflow-x-auto hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-white/5">
                                    <TableHead className="min-w-[200px] cursor-pointer select-none h-11" onClick={() => handleSort("title")}>
                                        Problem
                                        {sortConfig.key === "title" && <span className="ml-1 text-primary">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                    </TableHead>
                                    <TableHead className="w-[100px] cursor-pointer select-none h-11" onClick={() => handleSort("difficulty")}>
                                        Difficulty
                                        {sortConfig.key === "difficulty" && <span className="ml-1 text-primary">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                    </TableHead>
                                    <TableHead className="w-[140px] cursor-pointer select-none h-11" onClick={() => handleSort("nextReviewAt")}>
                                        Next Review
                                        {sortConfig.key === "nextReviewAt" && <span className="ml-1 text-primary">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                    </TableHead>
                                    <TableHead className="w-[100px] cursor-pointer select-none h-11 text-right" onClick={() => handleSort("reviewCount")}>
                                        Reviews
                                        {sortConfig.key === "reviewCount" && <span className="ml-1 text-primary">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                                    </TableHead>
                                    <TableHead className="w-[100px] h-11 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i} className="border-b border-white/5">
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-8 float-right" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 float-right" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : sortedProblems && sortedProblems.length > 0 ? (
                                    sortedProblems.map((problem: any) => {
                                        const isDue = isBefore(new Date(problem.nextReviewAt), endOfDay(new Date()))
                                        return (
                                            <TableRow key={problem.id} className="group hover:bg-white/[0.02] border-b border-white/5 transition-colors">
                                                <TableCell className="py-3">
                                                    <div className="flex flex-col">
                                                        <Link href={`/problems/${problem.id}`} className="font-medium text-sm hover:text-primary transition-colors truncate max-w-[300px]">
                                                            {problem.title}
                                                        </Link>
                                                        <span className="text-[11px] text-muted-foreground font-mono mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            {problem.problemSlug || problem.leetcodeSlug}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={`font-mono text-[10px] uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}
                                                    >
                                                        {problem.difficulty}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs py-3">
                                                    <span className={cn(isDue ? "text-[#BB7331] font-medium" : "")}>
                                                        {format(new Date(problem.nextReviewAt), "MMM d, yyyy")}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground py-3">
                                                    {problem.reviewCount}
                                                </TableCell>
                                                <TableCell className="text-right py-3">
                                                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-lg" asChild>
                                                            <a href={problem.url} target="_blank" rel="noreferrer" title="Open in LeetCode">
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-lg" asChild>
                                                            <Link href={`/problems/${problem.id}`} title="View Details">
                                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64">
                                            <EmptyState
                                                icon={Filter}
                                                title="No problems found"
                                                description="Try adjusting your filters."
                                                action={{
                                                    label: "Reset Filters",
                                                    href: "/problems"
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
