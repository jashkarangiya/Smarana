"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    ReferenceLine,
} from "recharts";
import { Trophy, TrendingUp, TrendingDown, Award, Target } from "lucide-react";
import { format } from "date-fns";

interface ContestResult {
    date: string;
    platform: string;
    contestId: string;
    contestName: string | null;
    rating: number;
    delta: number | null;
    rank: number | null;
}

interface ContestMetrics {
    totalContests: number;
    bestRank: number | null;
    latestRating: number | null;
    maxRating: number | null;
    ratingChange30d: number | null;
}

interface ContestInsightsData {
    ratingHistory: ContestResult[];
    metrics: ContestMetrics;
}

const PLATFORM_COLORS: Record<string, string> = {
    leetcode: "#FFA116",
    codeforces: "#1F8ACB",
    atcoder: "#00A0F0",
    codechef: "#5B4638",
};

export function ContestRatingChart() {
    const [data, setData] = useState<ContestInsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchContestData();
    }, []);

    const fetchContestData = async () => {
        try {
            const res = await fetch("/api/insights/contests");
            if (!res.ok) throw new Error("Failed to fetch contest data");
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader className="p-3 sm:p-6">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48 mt-1" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Trophy className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                        {error || "No contest data available"}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { ratingHistory, metrics } = data;

    // Format data for the chart
    const chartData = ratingHistory.map((r) => ({
        ...r,
        dateLabel: format(new Date(r.date), "MMM d"),
    }));

    const hasData = chartData.length > 0;

    return (
        <Card className="md:col-span-7">
            <CardHeader className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            Contest Performance
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Your rating history across platforms
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard
                        label="Contests"
                        value={metrics.totalContests}
                        icon={Trophy}
                    />
                    <MetricCard
                        label="Best Rank"
                        value={metrics.bestRank ? `#${metrics.bestRank}` : "-"}
                        icon={Award}
                    />
                    <MetricCard
                        label="Current Rating"
                        value={metrics.latestRating || "-"}
                        icon={Target}
                    />
                    <MetricCard
                        label="30d Change"
                        value={
                            metrics.ratingChange30d !== null
                                ? `${metrics.ratingChange30d >= 0 ? "+" : ""}${metrics.ratingChange30d}`
                                : "-"
                        }
                        icon={metrics.ratingChange30d && metrics.ratingChange30d >= 0 ? TrendingUp : TrendingDown}
                        valueColor={
                            metrics.ratingChange30d === null
                                ? undefined
                                : metrics.ratingChange30d >= 0
                                ? "text-green-500"
                                : "text-red-500"
                        }
                    />
                </div>

                {/* Chart */}
                {hasData ? (
                    <div className="h-[200px] sm:h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <XAxis
                                    dataKey="dateLabel"
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
                                    width={40}
                                    domain={["auto", "auto"]}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        const d = payload[0].payload as ContestResult;
                                        return (
                                            <div className="bg-popover border rounded-lg px-3 py-2 shadow-lg text-xs">
                                                <p className="font-medium">{d.contestName || d.contestId}</p>
                                                <p className="text-muted-foreground capitalize">{d.platform}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span>Rating: <strong>{d.rating}</strong></span>
                                                    {d.delta !== null && (
                                                        <span className={d.delta >= 0 ? "text-green-500" : "text-red-500"}>
                                                            ({d.delta >= 0 ? "+" : ""}{d.delta})
                                                        </span>
                                                    )}
                                                </div>
                                                {d.rank && <p>Rank: #{d.rank}</p>}
                                            </div>
                                        );
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rating"
                                    stroke="#BB7331"
                                    strokeWidth={2}
                                    dot={{ fill: "#BB7331", strokeWidth: 0, r: 3 }}
                                    activeDot={{ r: 5, fill: "#BB7331" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                        <Trophy className="h-10 w-10 opacity-30 mb-3" />
                        <p className="text-sm">No contest data yet</p>
                        <p className="text-xs mt-1">
                            Connect your platforms and participate in contests to see your progress
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function MetricCard({
    label,
    value,
    icon: Icon,
    valueColor,
}: {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    valueColor?: string;
}) {
    return (
        <div className="rounded-lg border bg-card/50 p-3">
            <div className="flex items-center gap-2 mb-1">
                <Icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                    {label}
                </span>
            </div>
            <div className={`text-lg sm:text-xl font-bold ${valueColor || ""}`}>
                {value}
            </div>
        </div>
    );
}
