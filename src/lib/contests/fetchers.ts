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

// 2. LeetCode Direct
async function fetchLeetCode(): Promise<Contest[]> {
    try {
        const res = await fetch(LC_API, { next: { revalidate: 600 } })
        if (!res.ok) throw new Error("LC Failed")
        const data = await res.json()

        return (data.contests ?? [])
            .filter((c: any) => {
                const startTime = c.start_time * 1000
                // Include future contests or recently started
                return startTime > Date.now() - (c.duration * 1000)
            })
            .map((c: any) => {
                const startTime = c.start_time * 1000
                const now = Date.now()
                const endTime = startTime + (c.duration * 1000)
                let phase = "BEFORE"
                if (now >= startTime && now < endTime) phase = "CODING"
                else if (now >= endTime) phase = "FINISHED"

                return {
                    id: `leetcode:${c.titleAsyncSlug ?? c.titleSlug ?? c.title}`,
                    platform: "leetcode",
                    name: c.title,
                    startsAt: new Date(startTime).toISOString(),
                    durationSeconds: c.duration,
                    url: `https://leetcode.com/contest/${c.titleSlug ?? ""}`,
                    phase,
                }
            })
    } catch (e) {
        console.error("LeetCode fetch failed:", e)
        return []
    }
}

// 3. Kontests (The rest)
async function fetchOthers(): Promise<Contest[]> {
    try {
        // Short timeout for aggregator
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

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
                // Skip the ones we fetch directly to avoid duplicates/stale data
                return p !== "leetcode" && p !== "codeforces"
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
