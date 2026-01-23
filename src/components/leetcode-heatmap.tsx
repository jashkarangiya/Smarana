"use client"

import { useTheme } from "next-themes"
import { ActivityCalendar } from "react-activity-calendar"
import { Tooltip } from "@/components/ui/tooltip"

interface LeetCodeHeatmapProps {
    data: string | null
}

export function LeetCodeHeatmap({ data }: LeetCodeHeatmapProps) {
    const { theme } = useTheme()

    if (!data) return null

    // Parse LeetCode format: { "timestamp_seconds": count }
    // Convert to ActivityCalendar format: { date: "YYYY-MM-DD", count: number, level: number }
    const calendarData = (() => {
        try {
            const parsed = JSON.parse(data)
            const activity = Object.entries(parsed).map(([timestamp, count]) => {
                const date = new Date(parseInt(timestamp) * 1000)
                return {
                    date: date.toISOString().split('T')[0],
                    count: count as number,
                    level: Math.min(4, Math.ceil((count as number) / 2)) // Simple scaling
                }
            })

            // Fill in the last year
            const today = new Date()
            const oneYearAgo = new Date()
            oneYearAgo.setFullYear(today.getFullYear() - 1)

            return activity.filter(item => new Date(item.date) >= oneYearAgo)
        } catch {
            return []
        }
    })()

    if (calendarData.length === 0) return null

    return (
        <div className="w-full flex justify-center py-4">
            <ActivityCalendar
                data={calendarData}
                theme={{
                    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                }}
                colorScheme={theme === 'dark' ? 'dark' : 'light'}
                labels={{
                    legend: {
                        less: 'Less',
                        more: 'More',
                    },
                    months: [
                        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ],
                    totalCount: '{{count}} submissions in the last year',
                    weekdays: [
                        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
                    ]
                }}
                showWeekdayLabels
            />
        </div>
    )
}
