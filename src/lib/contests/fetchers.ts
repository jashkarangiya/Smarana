import type { Contest } from "./types"

// --- TYPES ---
type KontestDTO = {
    name: string
    url: string
    start_time: string
    end_time: string
    duration: string
    site: string
    in_24_hours: string
    status: string
}

const KONTESTS_API = "https://kontests.net/api/v1/all"
const CF_API = "https://codeforces.com/api/contest.list?gym=false"
const LC_API = "https://leetcode.com/contest/api/list/"

const SITE_MAPPING: Record<string, string> = {
    LeetCode: "leetcode",
    CodeForces: "codeforces",
    AtCoder: "atcoder",
    CodeChef: "codechef",
    TopCoder: "topcoder",
    HackerRank: "hackerrank",
    HackerEarth: "hackerearth",
    KickStart: "kickstart",
}

function normalizePlatform(site: string): string {
    return SITE_MAPPING[site] || site.toLowerCase().replace(/\s+/g, "")
}

function getDurationSeconds(durationStr: string): number {
    const num = parseFloat(durationStr)
    return isNaN(num) ? 0 : num
}

// --- FETCHERS ---

// 1. Codeforces Direct
async function fetchCodeforces(): Promise<Contest[]> {
    try {
        const res = await fetch(CF_API, { next: { revalidate: 600 } })
        if (!res.ok) throw new Error("CF Failed")
        const data = await res.json()
        if (data.status !== "OK") throw new Error("CF API Status Error")

        return data.result
            .filter((c: any) => c.phase === "BEFORE" || c.phase === "CODING")
            .map((c: any) => ({
                id: `codeforces:${c.id}`,
                platform: "codeforces",
                name: c.name,
                startsAt: new Date(c.startTimeSeconds * 1000).toISOString(),
                durationSeconds: c.durationSeconds,
                url: `https://codeforces.com/contest/${c.id}`,
                phase: c.phase,
            }))
    } catch (e) {
        console.error("Codeforces fetch failed:", e)
        return []
    }
}

const LEETCODE_WEEKLY_SLUG = "weekly-contest-489";
const LEETCODE_BIWEEKLY_SLUG = "biweekly-contest-176";

function getNextWeeklyStartUtc(): Date {
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    // Weekly: Sunday 10:30 AM ET = 14:30 UTC (standard time)
    nextSunday.setUTCHours(14, 30, 0, 0);
    if (nextSunday.getTime() < now.getTime()) {
        nextSunday.setDate(nextSunday.getDate() + 7);
    }
    return nextSunday;
}

function getNextBiweeklyStartUtc(): Date {
    const now = new Date();
    const nextSaturday = new Date();
    // Saturday is day 6
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    // Biweekly: Saturday 10:30 AM ET = 14:30 UTC (standard time)
    nextSaturday.setUTCHours(14, 30, 0, 0);
    if (nextSaturday.getTime() < now.getTime()) {
        nextSaturday.setDate(nextSaturday.getDate() + 7);
    }
    return nextSaturday;
}

function buildLeetCodeFallback(): Contest[] {
    try {
        const weeklyStart = getNextWeeklyStartUtc();
        const biweeklyStart = getNextBiweeklyStartUtc();

        return [
            {
                id: `leetcode:${LEETCODE_WEEKLY_SLUG}`,
                platform: "leetcode",
                name: "LeetCode Weekly Contest 489",
                startsAt: weeklyStart.toISOString(),
                durationSeconds: 5400, // 90 min
                url: `https://leetcode.com/contest/${LEETCODE_WEEKLY_SLUG}/`,
                phase: "BEFORE"
            },
            {
                id: `leetcode:${LEETCODE_BIWEEKLY_SLUG}`,
                platform: "leetcode",
                name: "LeetCode Biweekly Contest 176",
                startsAt: biweeklyStart.toISOString(),
                durationSeconds: 5400, // 90 min
                url: `https://leetcode.com/contest/${LEETCODE_BIWEEKLY_SLUG}/`,
                phase: "BEFORE"
            }
        ];
    } catch (e) {
        return [];
    }
}

async function fetchLeetCode(): Promise<Contest[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(LC_API, {
            signal: controller.signal,
            next: { revalidate: 600 },
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://leetcode.com/contest/",
            },
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("LeetCode API failed");
        const data = await res.json();
        const contests = Array.isArray(data?.contests) ? data.contests : [];
        if (!contests.length) return buildLeetCodeFallback();

        const now = Date.now();
        return contests
            .map((c: any) => {
                const startSeconds = typeof c.start_time === "number" ? c.start_time : Number(c.start_time);
                const startMs = Number.isFinite(startSeconds) && startSeconds > 0
                    ? startSeconds * 1000
                    : Date.parse(c.start_time);
                if (!Number.isFinite(startMs)) return null;

                const durationSeconds = Number.isFinite(Number(c.duration))
                    ? Number(c.duration)
                    : 5400; // default 90 minutes if missing
                const endMs = startMs + durationSeconds * 1000;

                let phase = "BEFORE";
                if (now >= startMs && now < endMs) phase = "CODING";
                else if (now >= endMs) phase = "FINISHED";

                const slug = c.title_slug || c.slug || (c.title ? c.title.toLowerCase().replace(/\s+/g, "-") : undefined);
                const url = c.url
                    ? (String(c.url).startsWith("http") ? c.url : `https://leetcode.com${c.url}`)
                    : slug
                        ? `https://leetcode.com/contest/${slug}`
                        : "https://leetcode.com/contest/";

                const idBase = slug || (Number.isFinite(startSeconds) ? `start-${startSeconds}` : c.title || "contest");
                const id = `leetcode:${String(idBase).replace(/[^a-zA-Z0-9:_-]/g, "")}`;

                return {
                    id,
                    platform: "leetcode",
                    name: c.title || "LeetCode Contest",
                    startsAt: new Date(startMs).toISOString(),
                    durationSeconds,
                    url,
                    phase,
                } as Contest;
            })
            .filter(Boolean) as Contest[];
    } catch (e) {
        console.warn("LeetCode fetch failed, using fallback:", e);
        return buildLeetCodeFallback();
    }
}

// 3. Kontests (The rest)
async function fetchOthers(): Promise<Contest[]> {
    try {
        // Short timeout for aggregator
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const res = await fetch(KONTESTS_API, {
            signal: controller.signal,
            next: { revalidate: 900 }
        })
        clearTimeout(timeoutId)

        if (!res.ok) throw new Error("Kontests Failed")
        const data = (await res.json()) as KontestDTO[]

        return data
            .filter(c => {
                const p = normalizePlatform(c.site)
                // Skip the ones we fetch directly (Codeforces + LeetCode)
                return p !== "codeforces" && p !== "leetcode"
            })
            .map((c) => {
                const startTime = new Date(c.start_time)
                const platform = normalizePlatform(c.site)
                const id = `${platform}:${c.name.substring(0, 30)}:${startTime.getTime()}`.replace(/[^a-zA-Z0-9:_-]/g, "")

                return {
                    id,
                    platform,
                    name: c.name,
                    startsAt: c.start_time,
                    durationSeconds: getDurationSeconds(c.duration),
                    url: c.url,
                    phase: c.status === "CODING" ? "CODING" : "BEFORE",
                } as Contest
            })
    } catch (e) {
        // It's okay if this fails, we at least want major platforms
        console.warn("Kontests fetch failed (might be down/blocked):", e)
        return []
    }
}

export async function fetchAllContests(): Promise<Contest[]> {
    const [cf, lc, others] = await Promise.all([
        fetchCodeforces(),
        fetchLeetCode(),
        fetchOthers(),
    ])

    const all = [...cf, ...lc, ...others]

    // Global filter: Future or Active only
    const now = Date.now()
    return all
        .filter(c => {
            const end = new Date(c.startsAt).getTime() + (c.durationSeconds * 1000)
            return end > now
        })
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
}
