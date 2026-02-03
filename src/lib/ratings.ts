

export interface RatingHistoryEntry {
    platform: "leetcode" | "codeforces" | "atcoder" | "codechef";
    contestId: string;
    contestName: string;
    rating: number; // New rating after contest
    rank: number;
    attendedAt: Date;
    delta?: number;
}

/**
 * Fetch LeetCode rating history
 */
export async function fetchLeetCodeRating(username: string): Promise<RatingHistoryEntry[]> {
    const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Referer": `https://leetcode.com/${username}/`,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
            query: `
                query userContestRankingInfo($username: String!) {
                    userContestRankingHistory(username: $username) {
                        attended
                        rating
                        ranking
                        trendDirection
                        contest {
                            title
                            startTime
                        }
                    }
                }
            `,
            variables: { username },
        }),
    });

    if (!response.ok) throw new Error(`LeetCode API error: ${response.status}`);

    const data = await response.json();
    const history = data.data?.userContestRankingHistory || [];

    return history
        .filter((entry: any) => entry.attended)
        .map((entry: any) => ({
            platform: "leetcode",
            contestId: entry.contest.title.toLowerCase().replace(/\s+/g, '-'), // approximate slug
            contestName: entry.contest.title,
            rating: Math.round(entry.rating),
            rank: entry.ranking,
            attendedAt: new Date(entry.contest.startTime * 1000),
        }));
}

/**
 * Fetch Codeforces rating history
 */
export async function fetchCodeforcesRating(username: string): Promise<RatingHistoryEntry[]> {
    const response = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);

    if (!response.ok) throw new Error(`Codeforces API error: ${response.status}`);

    const data = await response.json();
    if (data.status !== "OK") throw new Error(data.comment || "Codeforces error");

    return data.result.map((entry: any) => ({
        platform: "codeforces",
        contestId: String(entry.contestId),
        contestName: entry.contestName,
        rating: entry.newRating,
        rank: entry.rank,
        attendedAt: new Date(entry.ratingUpdateTimeSeconds * 1000),
        delta: entry.newRating - entry.oldRating,
    }));
}

/**
 * Fetch AtCoder rating history
 * Scrapes from: https://atcoder.jp/users/<username>/history/json
 */
export async function fetchAtCoderRating(username: string): Promise<RatingHistoryEntry[]> {
    const response = await fetch(`https://atcoder.jp/users/${username}/history/json`);

    if (!response.ok) throw new Error(`AtCoder API error: ${response.status}`);

    const data = await response.json();

    return data.map((entry: any) => ({
        platform: "atcoder",
        contestId: entry.ContestScreenName.split('.')[0], // e.g. "abc300.contest.atcoder.jp" -> "abc300"
        contestName: entry.ContestName,
        rating: entry.NewRating,
        rank: entry.Place,
        attendedAt: new Date(entry.EndTime), // AtCoder gives end time, close enough
        delta: entry.NewRating - entry.OldRating,
    }));
}
