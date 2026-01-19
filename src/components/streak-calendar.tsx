"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Snowflake, Trophy } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isFuture } from "date-fns"

interface StreakCalendarProps {
    activityDates: Date[]
    currentStreak: number
    longestStreak: number
    streakFreezeUsed?: boolean
    className?: string
}

export function StreakCalendar({
    activityDates,
    currentStreak,
    longestStreak,
    streakFreezeUsed = false,
    className = ""
}: StreakCalendarProps) {
    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Get the day of week for the first day (0 = Sunday)
    const startDay = getDay(monthStart)

    // Create empty cells for days before the month starts
    const emptyDays = Array(startDay).fill(null)

    const hasActivity = (date: Date) => {
        return activityDates.some(d => isSameDay(new Date(d), date))
    }

    const getStreakMilestone = (streak: number) => {
        if (streak >= 100) return { emoji: "🔥", label: "100 day streak!", color: "text-rose-500" }
        if (streak >= 30) return { emoji: "⭐", label: "30 day streak!", color: "text-amber-500" }
        if (streak >= 7) return { emoji: "🌟", label: "Week streak!", color: "text-primary" }
        return null
    }

    const milestone = getStreakMilestone(currentStreak)

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {format(today, "MMMM yyyy")}
                    </CardTitle>
                    {streakFreezeUsed && (
                        <div className="flex items-center gap-1 text-xs text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-full">
                            <Snowflake className="h-3 w-3" />
                            Freeze Used
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Calendar Grid */}
                <div>
                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                            <div key={i} className="text-[10px] text-muted-foreground text-center font-medium">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {emptyDays.map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {daysInMonth.map((date, i) => {
                            const active = hasActivity(date)
                            const isTodayDate = isToday(date)
                            const future = isFuture(date)

                            return (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200 ${future
                                            ? "text-muted-foreground/30"
                                            : active
                                                ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30"
                                                : "bg-secondary text-muted-foreground"
                                        } ${isTodayDate ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                                >
                                    {format(date, "d")}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Streak Stats */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-xl font-bold text-orange-500">{currentStreak}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Current Streak</span>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            <span className="text-xl font-bold">{longestStreak}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Longest Streak</span>
                    </div>
                </div>

                {/* Milestone celebration */}
                {milestone && (
                    <div className={`flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 ${milestone.color}`}>
                        <span className="text-lg">{milestone.emoji}</span>
                        <span className="font-medium text-sm">{milestone.label}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
