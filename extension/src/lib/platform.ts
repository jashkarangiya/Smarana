export type Platform = "leetcode" | "codeforces" | "atcoder" | "codechef"

export interface ProblemContext {
    platform: Platform
    slug: string
}

/**
 * Detects the current platform and problem slug from a URL
 */
// Detects the current platform and problem slug from a URL
export function getProblemContext(url: string): ProblemContext | null {
    const u = new URL(url)

    // LeetCode
    if (u.hostname.includes("leetcode.com")) {
        const m = u.pathname.match(/\/problems\/([^/]+)/)
        if (m) return { platform: "leetcode", slug: m[1] }
    }

    // Codeforces
    if (u.hostname.includes("codeforces.com")) {
        // /problemset/problem/1705/C
        const m1 = u.pathname.match(/\/problemset\/problem\/(\d+)\/([A-Z0-9]+)/i)
        if (m1) return { platform: "codeforces", slug: `${m1[1]}-${m1[2]}`.toUpperCase() } // Normalize slug

        // /contest/1705/problem/C
        const m2 = u.pathname.match(/\/contest\/(\d+)\/problem\/([A-Z0-9]+)/i)
        if (m2) return { platform: "codeforces", slug: `${m2[1]}-${m2[2]}`.toUpperCase() }

        // gym?
        const m3 = u.pathname.match(/\/gym\/(\d+)\/problem\/([A-Z0-9]+)/i)
        if (m3) return { platform: "codeforces", slug: `${m3[1]}-${m3[2]}`.toUpperCase() }
    }

    // AtCoder
    if (u.hostname.includes("atcoder.jp")) {
        // /contests/<contest_id>/tasks/<problem_id>
        const m = u.pathname.match(/\/contests\/([^/]+)\/tasks\/([^/]+)/)
        if (m) return { platform: "atcoder", slug: m[2] }
    }

    // CodeChef
    if (u.hostname.includes("codechef.com")) {
        // /problems/<problem_code>
        const m = u.pathname.match(/\/problems\/([^/]+)/)
        if (m) return { platform: "codechef", slug: m[1] }
    }

    return null
}

/**
 * Returns a human-readable name for a platform
 */
export function getPlatformName(platform: Platform): string {
    const names: Record<Platform, string> = {
        leetcode: "LeetCode",
        codeforces: "Codeforces",
        atcoder: "AtCoder",
        codechef: "CodeChef",
    }
    return names[platform]
}

/**
 * Returns the color associated with a difficulty level
 */
export function getDifficultyColor(difficulty: string): string {
    const lower = difficulty.toLowerCase()
    if (lower === "easy") return "#00b8a3"
    if (lower === "medium") return "#ffc01e"
    if (lower === "hard") return "#ff375f"
    return "#888888"
}
