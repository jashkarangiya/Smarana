import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/insights/contests
 *
 * Returns contest participation history and rating data.
 */
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const platform = searchParams.get("platform");

        // Fetch contest results
        const where = platform
            ? { userId: session.user.id, platform }
            : { userId: session.user.id };

        const results = await prisma.contestResult.findMany({
            where,
            orderBy: { attendedAt: "asc" },
        });

        // Calculate metrics
        const metrics = calculateMetrics(results);

        // Format for charts
        const ratingHistory = results
            .filter((r) => r.newRating !== null)
            .map((r) => ({
                date: r.attendedAt.toISOString(),
                platform: r.platform,
                contestId: r.contestId,
                contestName: r.contestName,
                rating: r.newRating,
                delta: r.delta,
                rank: r.rank,
            }));

        return NextResponse.json({
            results,
            ratingHistory,
            metrics,
        });
    } catch (error) {
        console.error("Error fetching contest insights:", error);
        return NextResponse.json(
            { error: "Failed to fetch contest insights" },
            { status: 500 }
        );
    }
}

function calculateMetrics(results: any[]) {
    if (results.length === 0) {
        return {
            totalContests: 0,
            bestRank: null,
            latestRating: null,
            maxRating: null,
            ratingChange30d: null,
        };
    }

    const withRatings = results.filter((r) => r.newRating !== null);
    const withRanks = results.filter((r) => r.rank !== null);

    const latestRating = withRatings.length > 0
        ? withRatings[withRatings.length - 1].newRating
        : null;

    const maxRating = withRatings.length > 0
        ? Math.max(...withRatings.map((r) => r.newRating))
        : null;

    const bestRank = withRanks.length > 0
        ? Math.min(...withRanks.map((r) => r.rank))
        : null;

    // Calculate 30-day rating change
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recent = withRatings.filter((r) => new Date(r.attendedAt) >= thirtyDaysAgo);
    const ratingChange30d = recent.reduce((sum, r) => sum + (r.delta || 0), 0);

    return {
        totalContests: results.length,
        bestRank,
        latestRating,
        maxRating,
        ratingChange30d: recent.length > 0 ? ratingChange30d : null,
    };
}
