"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, ExternalLink, Trophy } from "lucide-react";
import { formatDistanceToNow, format, differenceInHours, addDays } from "date-fns";
import type { Contest } from "@/lib/contests/types";

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
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["contests"],
        queryFn: async () => {
            const res = await fetch("/api/contests");
            if (!res.ok) throw new Error("Failed to fetch contests");
            // The API returns { contests: Contest[] }
            return (await res.json()) as { contests: Contest[] };
        },
    });

    const contests = data?.contests || [];

    const nextWeekCutoff = addDays(new Date(), 7);
    const now = Date.now();

    // Helper to determine status since new API doesn't return phase
    const getContestStatus = (c: Contest) => {
        const start = new Date(c.startsAt).getTime();
        const end = start + c.durationSeconds * 1000;
        if (now >= start && now < end) return "CODING";
        if (now < start) return "BEFORE";
        return "FINISHED";
    };

    const upcomingContests = contests
        .filter((c) => getContestStatus(c) === "BEFORE")
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

    const next7Days = upcomingContests.filter(c => new Date(c.startsAt) <= nextWeekCutoff);
    const otherUpcoming = upcomingContests.filter(c => new Date(c.startsAt) > nextWeekCutoff);

    const liveContests = contests.filter((c) => getContestStatus(c) === "CODING");

    const getTimeUntilStart = (startTime: string) => {
        const start = new Date(startTime);
        const hoursUntil = differenceInHours(start, new Date());

        if (hoursUntil < 24) {
            return formatDistanceToNow(start, { addSuffix: true });
        }
        return format(start, "MMM d 'at' h:mm a");
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return null;
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    };

    if (isLoading) {
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
                        <p className="text-destructive">Failed to load contests</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => refetch()}
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
                                getTimeUntilStart={getTimeUntilStart}
                                formatDuration={formatDuration}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Contests */}
            <section className="space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-green-500" />
                        <h2 className="text-lg font-semibold">Next 7 Days</h2>
                    </div>

                    {next7Days.length === 0 && otherUpcoming.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                            <Trophy className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No upcoming contests found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {next7Days.length > 0 ? (
                                next7Days.map((contest) => (
                                    <ContestCard
                                        key={contest.id}
                                        contest={contest}
                                        getTimeUntilStart={getTimeUntilStart}
                                        formatDuration={formatDuration}
                                    />
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm italic">No contests in the next 7 days.</p>
                            )}
                        </div>
                    )}
                </div>

                {otherUpcoming.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4 mt-8">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Later</h2>
                        </div>
                        <div className="space-y-3">
                            {otherUpcoming.map((contest) => (
                                <ContestCard
                                    key={contest.id}
                                    contest={contest}
                                    getTimeUntilStart={getTimeUntilStart}
                                    formatDuration={formatDuration}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Info */}
            <p className="text-xs text-muted-foreground/60 text-center pt-4">
                Contest data is updated periodically (cached for 15m). Times are shown in your local timezone.
            </p>
        </div>
    );
}

function ContestCard({
    contest,
    isLive = false,
    getTimeUntilStart,
    formatDuration,
}: {
    contest: Contest;
    isLive?: boolean;
    getTimeUntilStart: (startTime: string) => string;
    formatDuration: (seconds: number) => string | null;
}) {
    const platformColor =
        PLATFORM_COLORS[contest.platform] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
    const platformName = PLATFORM_NAMES[contest.platform] || contest.platform;

    const startDate = new Date(contest.startsAt);
    const hoursUntil = differenceInHours(startDate, new Date());
    const isStartingSoon = hoursUntil <= 24 && hoursUntil > 0;

    return (
        <Card
            className={`transition-all hover:border-primary/20 ${isLive
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
                                {isLive ? "In progress" : getTimeUntilStart(contest.startsAt)}
                            </span>
                            {contest.durationSeconds > 0 && (
                                <span>{formatDuration(contest.durationSeconds)}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
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

