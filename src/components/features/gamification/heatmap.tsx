"use client"

import {
    format,
    startOfYear,
    endOfYear,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
} from "date-fns"
import { useMemo, useState } from "react"

interface HeatmapProps {
    data: Record<string, number>
    className?: string
    /** Optional: which year to render (defaults to next year) */
    year?: number
}

type Cell = {
    date: Date | null
    count: number
    isInYear: boolean
}

export function Heatmap({ data, className = "", year }: HeatmapProps) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null)

    const { monthsBlocks, totalContributions, activeDays, maxStreak, maxCount, yearLabel } = useMemo(() => {
        const now = new Date()
        const targetYear = year ?? now.getFullYear() // Default to current year

        const yearStart = startOfYear(new Date(targetYear, 0, 1))
        const yearEnd = endOfYear(new Date(targetYear, 0, 1))

        let maxCount = 0
        let totalContributions = 0
        let activeDays = 0
        let maxStreak = 0
        let tempStreak = 0

        // Stats over the year
        const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd })
        for (const day of allDays) {
            const key = format(day, "yyyy-MM-dd")
            const count = data[key] || 0

            if (count > maxCount) maxCount = count
            if (count > 0) {
                totalContributions += count
                activeDays++
                tempStreak++
                if (tempStreak > maxStreak) maxStreak = tempStreak
            } else {
                tempStreak = 0
            }
        }

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        const monthsBlocks = months.map((label, monthIndex) => {
            const mStart = startOfMonth(new Date(targetYear, monthIndex, 1))
            const mEnd = endOfMonth(mStart)

            const daysInMonth = eachDayOfInterval({ start: mStart, end: mEnd })

            // Sunday-start (0=Sun..6=Sat)
            const offset = getDay(mStart)

            const cells: Cell[] = []
            for (let i = 0; i < offset; i++) cells.push({ date: null, count: 0, isInYear: false })

            for (const d of daysInMonth) {
                const key = format(d, "yyyy-MM-dd")
                const count = data[key] || 0
                cells.push({ date: d, count, isInYear: true })
            }

            while (cells.length % 7 !== 0) cells.push({ date: null, count: 0, isInYear: false })

            const weeks: Cell[][] = []
            for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

            return { label, weeks }
        })

        return {
            monthsBlocks,
            totalContributions,
            activeDays,
            maxStreak,
            maxCount,
            yearLabel: String(targetYear),
        }
    }, [data, year])

    /**
     * Responsive sizing:
     * - Slightly larger cells for better visibility
     */
    const cellSize = 12
    const cellGap = 3
    const monthGap = 12

    const getColor = (cell: Cell): string => {
        if (!cell.isInYear || !cell.date) return "transparent"
        if (cell.count === 0) return "#161b22"
        if (maxCount === 0) return "#161b22"

        const ratio = cell.count / Math.max(maxCount, 1)
        if (ratio <= 0.25) return "#0e4429"
        if (ratio <= 0.5) return "#006d32"
        if (ratio <= 0.75) return "#26a641"
        return "#39d353"
    }

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Helper: width of a month block for centering month label
    const monthBlockWidthPx = (weeksCount: number) => weeksCount * cellSize + Math.max(0, weeksCount - 1) * cellGap

    return (
        <div className={className}>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-base font-bold">{totalContributions}</span>
                    <span className="text-muted-foreground text-sm">submissions in {yearLabel}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span>
                        <span className="text-muted-foreground">Total active days: </span>
                        <span className="font-medium">{activeDays}</span>
                    </span>
                    <span>
                        <span className="text-muted-foreground">Max streak: </span>
                        <span className="font-medium">{maxStreak}</span>
                    </span>
                </div>
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
                <div className="inline-flex min-w-max">
                    {/* Day labels */}
                    <div
                        className="flex flex-col pr-2 shrink-0"
                        style={{
                            gap: cellGap,
                        }}
                    >
                        {dayLabels.map((label, i) => (
                            <span
                                key={i}
                                className="text-[10px] text-muted-foreground leading-none flex items-center"
                                style={{
                                    height: `${cellSize}px`,
                                    visibility: i % 2 === 1 ? "visible" : "hidden", // show Mon, Wed, Fri
                                }}
                            >
                                {label}
                            </span>
                        ))}
                    </div>

                    {/* Month blocks + labels */}
                    <div className="flex flex-col">
                        {/* Grid */}
                        <div className="flex items-start">
                            {monthsBlocks.map((m, mi) => (
                                <div
                                    key={m.label}
                                    className="flex"
                                    style={{
                                        marginLeft: mi === 0 ? 0 : monthGap,
                                    }}
                                >
                                    {m.weeks.map((weekCol, wi) => (
                                        <div
                                            key={wi}
                                            className="flex flex-col"
                                            style={{
                                                gap: cellGap,
                                                marginLeft: wi === 0 ? 0 : cellGap,
                                            }}
                                        >
                                            {weekCol.map((cell, di) => (
                                                <div
                                                    key={di}
                                                    className="rounded-sm transition-colors duration-100 cursor-pointer"
                                                    style={{
                                                        width: cellSize,
                                                        height: cellSize,
                                                        backgroundColor: getColor(cell),
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!cell.date) return
                                                        const rect = e.currentTarget.getBoundingClientRect()
                                                        setTooltip({
                                                            x: rect.left + rect.width / 2,
                                                            y: rect.top,
                                                            date: format(cell.date, "EEEE, MMM d, yyyy"),
                                                            count: cell.count,
                                                        })
                                                    }}
                                                    onMouseLeave={() => setTooltip(null)}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Month labels - centered under each month block */}
                        <div className="flex mt-1">
                            {monthsBlocks.map((m, mi) => {
                                const w = monthBlockWidthPx(m.weeks.length)
                                return (
                                    <div
                                        key={m.label}
                                        className="text-[10px] text-muted-foreground"
                                        style={{
                                            marginLeft: mi === 0 ? 0 : monthGap,
                                            width: w,
                                            textAlign: "center", // ✅ centered
                                        }}
                                    >
                                        {m.label}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-2 text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="flex" style={{ gap: "3px" }}>
                    <div className="rounded-sm" style={{ width: "10px", height: "10px", backgroundColor: "#161b22" }} />
                    <div className="rounded-sm" style={{ width: "10px", height: "10px", backgroundColor: "#0e4429" }} />
                    <div className="rounded-sm" style={{ width: "10px", height: "10px", backgroundColor: "#006d32" }} />
                    <div className="rounded-sm" style={{ width: "10px", height: "10px", backgroundColor: "#26a641" }} />
                    <div className="rounded-sm" style={{ width: "10px", height: "10px", backgroundColor: "#39d353" }} />
                </div>
                <span>More</span>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 px-3 py-2 text-xs bg-[#161b22] text-white rounded-lg shadow-xl border border-[#30363d] pointer-events-none transform -translate-x-1/2 -translate-y-full whitespace-nowrap"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 8,
                    }}
                >
                    {tooltip.count === 0 ? (
                        <span className="text-gray-400">No submissions on {tooltip.date}</span>
                    ) : (
                        <>
                            <span className="font-semibold text-[#39d353]">
                                {tooltip.count} submission{tooltip.count !== 1 ? "s" : ""}
                            </span>
                            <span className="text-gray-300"> on {tooltip.date}</span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
