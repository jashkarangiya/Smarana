"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
const Heatmap = dynamic(() => import("@/components/features/gamification/heatmap").then(mod => mod.Heatmap), {
    loading: () => <div className="h-[200px] w-full animate-pulse bg-muted/10 rounded-lg" />,
    ssr: false
})
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, PieChart, Pie } from "recharts"
import { Activity, Calendar, Award, TrendingUp, Target, Flame } from "lucide-react"

export default function InsightsPage() {
    const [stats, setStats] = useState<any>(null)
    const [activity, setActivity] = useState<Record<string, number>>({})
    const [forecast, setForecast] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, activityRes, forecastRes] = await Promise.all([
                    fetch("/api/insights/stats"),
                    fetch("/api/insights/activity"),
                    fetch("/api/insights/forecast")
                ])

                const statsData = await statsRes.json()
                const activityData = await activityRes.json()
                const forecastData = await forecastRes.json()

                setStats(statsData.stats)
                setActivity(activityData)
                setForecast(forecastData)
            } catch (error) {
                console.error("Failed to fetch insights:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="container px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 sm:h-32 bg-muted rounded-xl" />
                    ))}
                </div>
                <div className="h-48 sm:h-64 bg-muted rounded-xl" />
            </div>
        )
    }

    const pieData = stats ? [
        { name: 'Easy', value: stats.difficulties.easy, color: '#22c55e' },
        { name: 'Medium', value: stats.difficulties.medium, color: '#eab308' },
        { name: 'Hard', value: stats.difficulties.hard, color: '#ef4444' },
    ].filter(d => d.value > 0) : []

    return (
        <div className="container px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Insights</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Track your progress and consistency.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Reviews</CardTitle>
                        <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                        <div className="text-xl sm:text-2xl font-bold">{stats?.totalReviews || 0}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                            Lifetime reviews
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">Current Streak</CardTitle>
                        <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                        <div className="text-xl sm:text-2xl font-bold">{stats?.currentStreak || 0} <span className="text-sm sm:text-base font-normal">days</span></div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                            Keep it up!
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">Mastery Score</CardTitle>
                        <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                        <div className="text-xl sm:text-2xl font-bold">{stats?.masteryScore || 0}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                            Avg retention (days)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">Level {stats?.level || 1}</CardTitle>
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                        <div className="text-xl sm:text-2xl font-bold">{stats?.xp || 0} <span className="text-sm sm:text-base font-normal">XP</span></div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                            Total Experience
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
                {/* Heatmap Section */}
                <Card className="md:col-span-7">
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">Activity Log</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Your review consistency over the year</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                        <div className="overflow-x-auto">
                            <Heatmap data={activity} />
                        </div>
                    </CardContent>
                </Card>

                {/* Forecast Chart */}
                <Card className="md:col-span-4">
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">Review Forecast</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Upcoming reviews for the next 14 days</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0 pl-0 sm:pl-2">
                        <div className="h-[200px] sm:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={forecast}>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888888"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                        width={24}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: "#1f2937", border: "none", fontSize: 12 }}
                                        itemStyle={{ color: "#fff" }}
                                        cursor={{ fill: "rgba(255,255,255,0.1)" }}
                                    />
                                    <Bar dataKey="count" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Difficulty Distribution */}
                <Card className="md:col-span-3">
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">Difficulty Breakdown</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Problems by difficulty</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                        <div className="h-[200px] sm:h-[300px] w-full flex items-center justify-center">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-muted-foreground flex flex-col items-center gap-2">
                                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 opacity-50" />
                                    <p className="text-sm">No problems added yet</p>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
                            {pieData.map((entry) => (
                                <div key={entry.name} className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-xs sm:text-sm text-muted-foreground">{entry.name} ({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
