"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, BellOff, Calendar, Clock, ExternalLink, Trophy } from "lucide-react";
import { formatDistanceToNow, format, isPast, isFuture, differenceInHours } from "date-fns";

interface Contest {
    id: string;
    platform: string;
    contestId: string;
    name: string;
    startTime: string;
    endTime: string | null;
    duration: number | null;
    url: string;
    phase: string;
    hasReminder?: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
    leetcode: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    codeforces: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    atcoder: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    codechef: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const PLATFORM_NAMES: Record<string, string> = {
    leetcode: "LeetCode",
    codeforces: "Codeforces",
    atcoder: "AtCoder",
    codechef: "CodeChef",
};

export function ContestsClient() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [togglingReminder, setTogglingReminder] = useState<string | null>(null);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const res = await fetch("/api/contests");
            if (!res.ok) throw new Error("Failed to fetch contests");
            const data = await res.json();
            setContests(data.contests || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load contests");
        } finally {
            setLoading(false);
        }
    };

    const toggleReminder = async (contestId: string, hasReminder: boolean) => {
        setTogglingReminder(contestId);
        try {
            const res = await fetch("/api/contests/reminder", {
                method: hasReminder ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contestId }),
            });
            if (!res.ok) throw new Error("Failed to toggle reminder");

            setContests((prev) =>
                prev.map((c) =>
                    c.id === contestId ? { ...c, hasReminder: !hasReminder } : c
                )
            );
        } catch (err) {
            console.error("Failed to toggle reminder:", err);
        } finally {
            setTogglingReminder(null);
        }
    };

    const upcomingContests = contests.filter(
        (c) => c.phase === "BEFORE" && isFuture(new Date(c.startTime))
    );

    const liveContests = contests.filter((c) => c.phase === "CODING");

    const getTimeUntilStart = (startTime: string) => {
        const start = new Date(startTime);
        const hoursUntil = differenceInHours(start, new Date());

        if (hoursUntil < 24) {
            return formatDistanceToNow(start, { addSuffix: true });
        }
        return format(start, "MMM d 'at' h:mm a");
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    };

    if (loading) {
        return (
            <div className="container max-w-4xl py-8 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-4xl py-8">
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="py-8 text-center">
                        <p className="text-destructive">{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                fetchContests();
                            }}
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-8 space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Contests</h1>
                <p className="text-muted-foreground">
                    Upcoming contests from your favorite platforms
                </p>
            </div>

            {/* Live Contests */}
            {liveContests.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <h2 className="text-lg font-semibold">Live Now</h2>
                    </div>
                    <div className="space-y-3">
                        {liveContests.map((contest) => (
                            <ContestCard
                                key={contest.id}
                                contest={contest}
                                isLive
                                onToggleReminder={toggleReminder}
                                isTogglingReminder={togglingReminder === contest.id}
                                getTimeUntilStart={getTimeUntilStart}
                                formatDuration={formatDuration}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Contests */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">Upcoming</h2>
                </div>

                {upcomingContests.length === 0 ? (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="py-12 text-center">
                            <Trophy className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">
                                No upcoming contests found.
                            </p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                Check back later or refresh to see new contests.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {upcomingContests.map((contest) => (
                            <ContestCard
                                key={contest.id}
                                contest={contest}
                                onToggleReminder={toggleReminder}
                                isTogglingReminder={togglingReminder === contest.id}
                                getTimeUntilStart={getTimeUntilStart}
                                formatDuration={formatDuration}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Info */}
            <p className="text-xs text-muted-foreground/60 text-center pt-4">
                Contest data is updated periodically. Times are shown in your local timezone.
            </p>
        </div>
    );
}

function ContestCard({
    contest,
    isLive = false,
    onToggleReminder,
    isTogglingReminder,
    getTimeUntilStart,
    formatDuration,
}: {
    contest: Contest;
    isLive?: boolean;
    onToggleReminder: (id: string, hasReminder: boolean) => void;
    isTogglingReminder: boolean;
    getTimeUntilStart: (startTime: string) => string;
    formatDuration: (minutes: number | null) => string | null;
}) {
    const platformColor =
        PLATFORM_COLORS[contest.platform] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
    const platformName = PLATFORM_NAMES[contest.platform] || contest.platform;

    const startDate = new Date(contest.startTime);
    const hoursUntil = differenceInHours(startDate, new Date());
    const isStartingSoon = hoursUntil <= 24 && hoursUntil > 0;

    return (
        <Card
            className={`transition-all hover:border-primary/20 ${
                isLive
                    ? "border-red-500/30 bg-red-500/5"
                    : isStartingSoon
                    ? "border-amber-500/30 bg-amber-500/5"
                    : ""
            }`}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={platformColor}>
                                {platformName}
                            </Badge>
                            {isLive && (
                                <Badge variant="destructive" className="text-xs">
                                    LIVE
                                </Badge>
                            )}
                            {isStartingSoon && !isLive && (
                                <Badge
                                    variant="outline"
                                    className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs"
                                >
                                    Starting Soon
                                </Badge>
                            )}
                        </div>

                        <h3 className="font-medium text-sm sm:text-base truncate">
                            {contest.name}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {isLive ? "In progress" : getTimeUntilStart(contest.startTime)}
                            </span>
                            {contest.duration && (
                                <span>{formatDuration(contest.duration)}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {!isLive && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-9 w-9 ${
                                    contest.hasReminder
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }`}
                                onClick={() =>
                                    onToggleReminder(contest.id, !!contest.hasReminder)
                                }
                                disabled={isTogglingReminder}
                                title={
                                    contest.hasReminder
                                        ? "Remove reminder"
                                        : "Set reminder"
                                }
                            >
                                {contest.hasReminder ? (
                                    <Bell className="h-4 w-4 fill-current" />
                                ) : (
                                    <BellOff className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9"
                            asChild
                        >
                            <a
                                href={contest.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="hidden sm:inline mr-1">Open</span>
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
