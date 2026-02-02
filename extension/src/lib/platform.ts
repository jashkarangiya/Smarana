export type Platform = "leetcode" | "codeforces" | "atcoder" | "codechef"

export interface ProblemContext {
    platform: Platform
    slug: string
}

/**
 * Detects the current platform and problem slug from a URL
 */
export function getProblemContext(url: string): ProblemContext | null {
    // LeetCode: leetcode.com/problems/<slug>/...
    const lc = url.match(/leetcode\.com\/problems\/([^\/?#]+)/i)
    if (lc) {
        return { platform: "leetcode", slug: lc[1].toLowerCase() }
    }

    // Codeforces contest: codeforces.com/contest/<id>/problem/<index>
    const cf1 = url.match(/codeforces\.com\/contest\/(\d+)\/problem\/([A-Z0-9]+)/i)
    if (cf1) {
        return { platform: "codeforces", slug: `${cf1[1]}-${cf1[2].toUpperCase()}` }
    }

    // Codeforces problemset: codeforces.com/problemset/problem/<id>/<index>
    const cf2 = url.match(/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z0-9]+)/i)
    if (cf2) {
        return { platform: "codeforces", slug: `${cf2[1]}-${cf2[2].toUpperCase()}` }
    }

    // AtCoder: atcoder.jp/contests/<contestId>/tasks/<taskId>
    const ac = url.match(/atcoder\.jp\/contests\/([^\/?#]+)\/tasks\/([^\/?#]+)/i)
    if (ac) {
        return { platform: "atcoder", slug: `${ac[1]}-${ac[2]}` }
    }

    // CodeChef: codechef.com/problems/<code>
    const cc = url.match(/codechef\.com\/problems\/([^\/?#]+)/i)
    if (cc) {
        return { platform: "codechef", slug: cc[1].toUpperCase() }
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
