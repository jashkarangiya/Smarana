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
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <CalendarIcon className="h-8 w-8 text-primary" />
                    Schedule
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage your upcoming reviews and plan your study sessions.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Calendar Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle>
                                {format(viewDate, "MMMM yyyy")}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setViewDate(d => addDays(d, -30))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setViewDate(new Date())}>
                                    Today
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setViewDate(d => addDays(d, 30))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground mb-2">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                    <div key={day} className="py-2">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
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
                                                "min-h-[80px] p-2 rounded-lg border text-left transition-colors relative group hover:border-primary/50",
                                                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                                                isSelected && "ring-2 ring-primary border-primary",
                                                isToday(day) && !isSelected && "bg-primary/5 border-primary/30"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm font-medium block mb-1",
                                                isToday(day) && "text-primary"
                                            )}>
                                                {format(day, "d")}
                                            </span>

                                            {dayProblems.length > 0 && (
                                                <div className="space-y-1">
                                                    <Badge variant="secondary" className="w-full justify-center text-[10px] h-5 px-1 bg-primary/10 text-primary hover:bg-primary/20">
                                                        {dayProblems.length} due
                                                    </Badge>
                                                    <div className="flex gap-0.5 justify-center">
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
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                {isToday(selectedDate) ? "Duet Today" : format(selectedDate, "EEEE, MMMM do")}
                            </CardTitle>
                            <CardDescription>
                                {problemsForDate.length} problems scheduled for review
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {problemsForDate.length > 0 ? (
                                <div className="space-y-3">
                                    {problemsForDate.map((problem: any) => (
                                        <div key={problem.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                                                    {problem.difficulty}
                                                </Badge>
                                                <Link href={`/problems/${problem.id}`} className="font-medium hover:underline">
                                                    {problem.title}
                                                </Link>
                                            </div>
                                            <div className="flex items-center gap-2">
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
                                        <div className="pt-4">
                                            <Button asChild className="w-full">
                                                <Link href="/review">Start Review Session</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No reviews scheduled for this day.</p>
                                    <p className="text-sm mt-1">Enjoy your free time! 🎉</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Overdue */}
                    {overdueProblems.length > 0 && (
                        <Card className="border-rose-500/20 bg-rose-500/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-rose-500">
                                    <AlertCircle className="h-5 w-5" />
                                    Overdue ({overdueProblems.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {overdueProblems.slice(0, 5).map((problem: any) => (
                                    <div key={problem.id} className="flex items-center justify-between text-sm">
                                        <span className="truncate flex-1 pr-2">{problem.title}</span>
                                        <span className="text-rose-500 font-mono text-xs">
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
                        <CardHeader>
                            <CardTitle>Upcoming</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingProblems.length > 0 ? (
                                upcomingProblems.map((problem: any) => (
                                    <div key={problem.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full shrink-0",
                                                problem.difficulty === 'Easy' && "bg-emerald-500",
                                                problem.difficulty === 'Medium' && "bg-amber-500",
                                                problem.difficulty === 'Hard' && "bg-rose-500",
                                            )} />
                                            <span className="truncate">{problem.title}</span>
                                        </div>
                                        <span className="text-muted-foreground font-mono text-xs whitespace-nowrap ml-2">
                                            {format(new Date(problem.nextReviewAt), "MMM d")}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
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
