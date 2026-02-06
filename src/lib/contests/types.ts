export type ContestPlatform = "leetcode" | "codeforces" | "atcoder" | "codechef" | string

export type Contest = {
    id: string
    platform: ContestPlatform
    name: string
    startsAt: string // ISO
    durationSeconds: number
    url: string
    phase: string // "BEFORE" | "CODING" | "FINISHED"
}
