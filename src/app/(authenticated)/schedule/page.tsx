"use client"

import { useState } from "react"
import { useProblems } from "@/hooks/use-problems"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar as CalendarIcon, Clock, AlertCircle, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import {
    format,
    addDays,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    isPast,
    isFuture
} from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SchedulePage() {
    const { data: allProblems, isLoading } = useProblems("all")
    const queryClient = useQueryClient()

    const [viewDate, setViewDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())

    const snoozeMutation = useMutation({
        mutationFn: async ({ id, days }: { id: string, days: number }) => {
            const res = await fetch(`/api/problems/${id}/snooze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ days }),
            })
            if (!res.ok) throw new Error("Failed to snooze")
            return res.json()
        },
        onSuccess: () => {
            toast.success("Problem rescheduled")
            queryClient.invalidateQueries({ queryKey: ["problems"] })
        },
        onError: () => {
            toast.error("Failed to reschedule")
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

    // Calendar Logic
    const monthStart = startOfMonth(viewDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    // Filter problems for selected date
    const problemsForDate = allProblems?.filter((p: any) =>
        isSameDay(new Date(p.nextReviewAt), selectedDate)
    ) || []

    // Group problems by date for calendar indicators
    const problemsByDate = allProblems?.reduce((acc: any, p: any) => {
        const dateKey = format(new Date(p.nextReviewAt), 'yyyy-MM-dd')
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(p)
        return acc
    }, {}) || {}

    const overdueProblems = allProblems?.filter((p: any) =>
        isPast(new Date(p.nextReviewAt)) && !isToday(new Date(p.nextReviewAt))
    ) || []

    const upcomingProblems = allProblems?.filter((p: any) =>
        isFuture(new Date(p.nextReviewAt)) && !isSameDay(new Date(p.nextReviewAt), selectedDate)
    )?.sort((a: any, b: any) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime())
        ?.slice(0, 5) || []

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
            <div className="mb-4 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                    <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    Schedule
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                    Manage your upcoming reviews and plan your study sessions.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
                {/* Calendar Column */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 px-3 sm:px-6">
                            <CardTitle className="text-base sm:text-lg">
                                {format(viewDate, "MMMM yyyy")}
                            </CardTitle>
                            <div className="flex gap-1 sm:gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => setViewDate(d => addDays(d, -30))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm" onClick={() => {
                                    const today = new Date()
                                    setViewDate(today)
                                    setSelectedDate(today)
                                }}>
                                    Today
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => setViewDate(d => addDays(d, 30))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-2 sm:px-6">
                            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-[10px] sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">
                                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                                    <div key={i} className="py-1 sm:py-2 sm:hidden">{day}</div>
                                ))}
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                    <div key={day} className="py-2 hidden sm:block">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                                {calendarDays.map((day, idx) => {
                                    const dateKey = format(day, 'yyyy-MM-dd')
                                    const dayProblems = problemsByDate[dateKey] || []
                                    const isSelected = isSameDay(day, selectedDate)
                                    const isCurrentMonth = isSameMonth(day, monthStart)

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            onClick={() => setSelectedDate(day)}
                                            className={cn(
                                                "min-h-[52px] sm:min-h-[80px] p-1 sm:p-2 rounded-md sm:rounded-lg border text-left transition-colors relative group hover:border-primary/50",
                                                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                                                isSelected && "ring-2 ring-primary border-primary",
                                                isToday(day) && !isSelected && "bg-primary/5 border-primary/30"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-xs sm:text-sm font-medium block mb-0.5 sm:mb-1",
                                                isToday(day) && "text-primary"
                                            )}>
                                                {format(day, "d")}
                                            </span>

                                            {dayProblems.length > 0 && (
                                                <div className="space-y-0.5 sm:space-y-1">
                                                    {/* Mobile: Just show count dot */}
                                                    <div className="sm:hidden flex justify-center">
                                                        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <span className="text-[8px] font-bold text-primary">{dayProblems.length}</span>
                                                        </div>
                                                    </div>
                                                    {/* Desktop: Show full badge */}
                                                    <Badge variant="secondary" className="hidden sm:flex w-full justify-center text-[10px] h-5 px-1 bg-primary/10 text-primary hover:bg-primary/20">
                                                        {dayProblems.length} due
                                                    </Badge>
                                                    <div className="hidden sm:flex gap-0.5 justify-center">
                                                        {dayProblems.slice(0, 3).map((p: any, i: number) => (
                                                            <div
                                                                key={i}
                                                                className={cn(
                                                                    "h-1.5 w-1.5 rounded-full",
                                                                    p.difficulty === 'Easy' && "bg-emerald-500",
                                                                    p.difficulty === 'Medium' && "bg-amber-500",
                                                                    p.difficulty === 'Hard' && "bg-rose-500",
                                                                )}
                                                            />
                                                        ))}
                                                        {dayProblems.length > 3 && (
                                                            <span className="text-[8px] text-muted-foreground leading-none self-end">+</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Date Details */}
                    <Card>
                        <CardHeader className="px-3 sm:px-6">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                                {isToday(selectedDate) ? "Due Today" : format(selectedDate, "EEE, MMM d")}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                {problemsForDate.length} problem{problemsForDate.length !== 1 ? 's' : ''} scheduled
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6">
                            {problemsForDate.length > 0 ? (
                                <div className="space-y-2 sm:space-y-3">
                                    {problemsForDate.map((problem: any) => (
                                        <div key={problem.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors gap-2">
                                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                <Badge variant="outline" className={cn("shrink-0 text-[10px] sm:text-xs", getDifficultyColor(problem.difficulty))}>
                                                    {problem.difficulty}
                                                </Badge>
                                                <Link href={`/problems/${problem.id}`} className="text-sm sm:text-base font-medium hover:underline truncate">
                                                    {problem.title}
                                                </Link>
                                            </div>
                                            <div className="flex items-center shrink-0">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => snoozeMutation.mutate({ id: problem.id, days: 1 })}>
                                                            Snooze 1 day
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => snoozeMutation.mutate({ id: problem.id, days: 3 })}>
                                                            Snooze 3 days
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => snoozeMutation.mutate({ id: problem.id, days: 7 })}>
                                                            Snooze 1 week
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}

                                    {isToday(selectedDate) && (
                                        <div className="pt-3 sm:pt-4">
                                            <Button asChild className="w-full">
                                                <Link href="/review">Start Review Session</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                                    <p className="text-sm sm:text-base">No reviews scheduled for this day.</p>
                                    <p className="text-xs sm:text-sm mt-1">Enjoy your free time!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Overdue */}
                    {overdueProblems.length > 0 && (
                        <Card className="border-rose-500/20 bg-rose-500/5">
                            <CardHeader className="px-3 sm:px-6">
                                <CardTitle className="flex items-center gap-2 text-rose-500 text-base sm:text-lg">
                                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Overdue ({overdueProblems.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6">
                                {overdueProblems.slice(0, 5).map((problem: any) => (
                                    <div key={problem.id} className="flex items-center justify-between text-xs sm:text-sm">
                                        <span className="truncate flex-1 pr-2">{problem.title}</span>
                                        <span className="text-rose-500 font-mono text-[10px] sm:text-xs">
                                            {format(new Date(problem.nextReviewAt), "MMM d")}
                                        </span>
                                    </div>
                                ))}
                                {overdueProblems.length > 5 && (
                                    <Button variant="link" className="text-rose-500 h-auto p-0 text-xs w-full text-center">
                                        View all overdue
                                    </Button>
                                )}
                                <Button asChild className="w-full mt-2" variant="destructive">
                                    <Link href="/review">Catch Up Now</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Upcoming List */}
                    <Card>
                        <CardHeader className="px-3 sm:px-6">
                            <CardTitle className="text-base sm:text-lg">Upcoming</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
                            {upcomingProblems.length > 0 ? (
                                upcomingProblems.map((problem: any) => (
                                    <div key={problem.id} className="flex items-center justify-between text-xs sm:text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full shrink-0",
                                                problem.difficulty === 'Easy' && "bg-emerald-500",
                                                problem.difficulty === 'Medium' && "bg-amber-500",
                                                problem.difficulty === 'Hard' && "bg-rose-500",
                                            )} />
                                            <span className="truncate">{problem.title}</span>
                                        </div>
                                        <span className="text-muted-foreground font-mono text-[10px] sm:text-xs whitespace-nowrap ml-2">
                                            {format(new Date(problem.nextReviewAt), "MMM d")}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                                    No upcoming reviews planned.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
