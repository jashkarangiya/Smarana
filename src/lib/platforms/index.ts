// Unified Platform Interface
// All platform fetchers implement this interface

export interface PlatformProblem {
    title: string
    problemSlug: string
    difficulty: string
    url: string
    solvedAt: Date
}

export interface PlatformFetcher {
    name: string
    id: string
    icon: string
    color: string
    fetchSolvedProblems: (username: string) => Promise<PlatformProblem[]>
    validateUsername?: (username: string) => Promise<boolean>
}

export const PLATFORMS: Record<string, { name: string; icon: string; color: string; available: boolean }> = {
    leetcode: {
        name: "LeetCode",
        icon: "🟡",
        color: "#FFA116",
        available: true,
    },
    codeforces: {
        name: "Codeforces",
        icon: "🔵",
        color: "#1F8ACB",
        available: true,
    },
    codechef: {
        name: "CodeChef",
        icon: "👨‍🍳",
        color: "#5B4638",
        available: true,
    },
    atcoder: {
        name: "AtCoder",
        icon: "⚫",
        color: "#222222",
        available: true,
    },
    hackerrank: {
        name: "HackerRank",
        icon: "🟢",
        color: "#00EA64",
        available: false,
    },
    geeksforgeeks: {
        name: "GeeksForGeeks",
        icon: "🟢",
        color: "#2F8D46",
        available: false,
    },
    interviewbit: {
        name: "InterviewBit",
        icon: "🔷",
        color: "#5B9BD5",
        available: false,
    },
    codestudio: {
        name: "CodeStudio",
        icon: "🟠",
        color: "#FF6B35",
        available: false,
    },
}

export function getPlatformInfo(platformId: string) {
    return PLATFORMS[platformId] || { name: platformId, icon: "📝", color: "#888888", available: false }
}
