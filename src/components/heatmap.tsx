"use client"

import { format, startOfYear, endOfYear, startOfWeek, addDays, differenceInCalendarWeeks, isAfter, isBefore } from "date-fns"
import { useMemo, useState } from "react"

interface HeatmapProps {
    data: Record<string, number>
    className?: string
}

export function Heatmap({ data, className = "" }: HeatmapProps) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number; isFuture: boolean } | null>(null)

    const { weeks, maxCount, monthLabels, totalContributions } = useMemo(() => {
        const today = new Date()
        const yearStart = startOfYear(today)
        const yearEnd = endOfYear(today)
        const startDate = startOfWeek(yearStart, { weekStartsOn: 0 })

        // Calculate weeks for the ENTIRE year (Jan 1 to Dec 31)
        const totalWeeks = differenceInCalendarWeeks(yearEnd, startDate, { weekStartsOn: 0 }) + 1
        const weeks: { date: Date; count: number; isFuture: boolean }[][] = []

        let maxCount = 0
        let totalContributions = 0
        let currentDate = new Date(startDate)

        for (let w = 0; w < totalWeeks; w++) {
            const week: { date: Date; count: number; isFuture: boolean }[] = []
            for (let d = 0; d < 7; d++) {
                const dateKey = format(currentDate, "yyyy-MM-dd")
                const count = data[dateKey] || 0
                if (count > maxCount) maxCount = count

                const isInYear = currentDate.getFullYear() === today.getFullYear()
                const isFuture = isAfter(currentDate, today)
                const isBeforeYear = isBefore(currentDate, yearStart)

                // Count only past dates in current year
                if (isInYear && !isFuture && count > 0) {
                    totalContributions += count
                }

                week.push({
                    date: new Date(currentDate),
                    count: isInYear && !isBeforeYear ? count : -1, // -1 means outside year
                    isFuture: isFuture && isInYear,
                })
                currentDate = addDays(currentDate, 1)
            }
            weeks.push(week)
        }

        // Calculate month labels
        const monthLabels: { label: string; colStart: number }[] = []
        const monthPositions = new Map<number, number>()

        weeks.forEach((week, i) => {
            // Find first day of each month
            week.forEach((day) => {
                if (day.count !== -1 || day.isFuture) {
                    const month = day.date.getMonth()
                    const dayOfMonth = day.date.getDate()
                    if (dayOfMonth <= 7 && !monthPositions.has(month)) {
                        monthPositions.set(month, i)
                    }
                }
            })
        })

        // Create sorted month labels
        Array.from(monthPositions.entries())
            .sort((a, b) => a[0] - b[0])
            .forEach(([month, colStart]) => {
                monthLabels.push({
                    label: format(new Date(today.getFullYear(), month), "MMM"),
                    colStart,
                })
            })

        return { weeks, maxCount, monthLabels, totalContributions }
    }, [data])

    const getIntensity = (count: number, isFuture: boolean): string => {
        if (count < 0) return "invisible" // Outside year
        if (isFuture) return "bg-[#161b22] border border-[#21262d]/50" // Future dates - dimmed
        if (count === 0) return "bg-[#161b22] border border-[#21262d]" // Past dates with no activity
        if (maxCount === 0) return "bg-[#161b22] border border-[#21262d]"

        const ratio = count / maxCount
        if (ratio <= 0.25) return "bg-[#0e4429]"
        if (ratio <= 0.5) return "bg-[#006d32]"
        if (ratio <= 0.75) return "bg-[#26a641]"
        return "bg-[#39d353]"
    }

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // LeetCode-style sizing
    const cellSize = 11
    const cellGap = 3

    return (
        <div className={`relative ${className}`}>
            {/* Header with total */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                    {totalContributions} contribution{totalContributions !== 1 ? 's' : ''} in {new Date().getFullYear()}
                </span>
            </div>

            {/* Month labels */}
            <div className="relative mb-2 ml-8 h-4">
                {monthLabels.map((m, i) => (
                    <span
                        key={i}
                        className="absolute text-[11px] text-muted-foreground"
                        style={{
                            left: `${m.colStart * (cellSize + cellGap)}px`,
                        }}
                    >
                        {m.label}
                    </span>
                ))}
            </div>

            <div className="flex">
                {/* Day labels - show Mon, Wed, Fri like LeetCode */}
                <div className="flex flex-col text-[9px] text-muted-foreground mr-1" style={{ gap: `${cellGap}px` }}>
                    {dayLabels.map((label, i) => (
                        <div
                            key={i}
                            className="w-7 text-right pr-1"
                            style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}
                        >
                            {i === 1 || i === 3 || i === 5 ? label : ""}
                        </div>
                    ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex overflow-x-auto" style={{ gap: `${cellGap}px` }}>
                    {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col" style={{ gap: `${cellGap}px` }}>
                            {week.map((day, di) => (
                                <div
                                    key={di}
                                    className={`rounded-[2px] transition-all duration-150 ${day.count >= 0 || day.isFuture
                                            ? 'cursor-pointer hover:ring-1 hover:ring-white/30'
                                            : ''
                                        } ${getIntensity(day.count, day.isFuture)}`}
                                    style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                                    onMouseEnter={(e) => {
                                        if (day.count >= 0 || day.isFuture) {
                                            const rect = e.currentTarget.getBoundingClientRect()
                                            setTooltip({
                                                x: rect.left + rect.width / 2,
                                                y: rect.top,
                                                date: format(day.date, "MMMM d, yyyy"),
                                                count: day.count,
                                                isFuture: day.isFuture,
                                            })
                                        }
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="flex" style={{ gap: '2px' }}>
                    <div className="rounded-[2px] bg-[#161b22] border border-[#21262d]" style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />
                    <div className="rounded-[2px] bg-[#0e4429]" style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />
                    <div className="rounded-[2px] bg-[#006d32]" style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />
                    <div className="rounded-[2px] bg-[#26a641]" style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />
                    <div className="rounded-[2px] bg-[#39d353]" style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />
                </div>
                <span>More</span>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 px-3 py-2 text-xs bg-[#1f2937] text-white rounded-md shadow-lg border border-[#374151] pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 8,
                    }}
                >
                    {tooltip.isFuture ? (
                        <>
                            <div className="text-gray-400">No contributions yet</div>
                            <div className="text-gray-500 text-[10px]">{tooltip.date}</div>
                        </>
                    ) : (
                        <>
                            <div className="font-medium">{tooltip.count} contribution{tooltip.count !== 1 ? 's' : ''}</div>
                            <div className="text-gray-400 text-[10px]">{tooltip.date}</div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
