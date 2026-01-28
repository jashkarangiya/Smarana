// AtCoder API Integration
// Uses community API: https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user={username}

import { PlatformProblem } from "./index"

interface AtCoderSubmission {
    id: number
    epoch_second: number
    problem_id: string
    contest_id: string
    user_id: string
    language: string
    point: number
    length: number
    result: string
    execution_time: number
}

interface AtCoderProblem {
    id: string
    contest_id: string
    problem_index: string
    name: string
    title: string
    difficulty?: number
}

function getDifficultyFromPoints(difficulty?: number): string {
    if (!difficulty) return "Medium"
    if (difficulty <= 400) return "Easy"
    if (difficulty <= 1200) return "Medium"
    return "Hard"
}

// Helper for timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        })
        return response
    } finally {
        clearTimeout(id)
    }
}

export async function fetchAtCoderSolvedProblems(username: string): Promise<PlatformProblem[]> {
    if (!username) return []

    try {
        // Fetch submissions
        const submissionsResponse = await fetchWithTimeout(
            `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${encodeURIComponent(username)}&from_second=0`
        )

        if (!submissionsResponse.ok) {
            console.error("AtCoder API error:", submissionsResponse.status)
            return []
        }

        const submissions: AtCoderSubmission[] = await submissionsResponse.json()

        // Filter to accepted submissions and deduplicate
        const seenProblems = new Set<string>()
        const problems: PlatformProblem[] = []

        // Sort by time (most recent first)
        submissions.sort((a, b) => b.epoch_second - a.epoch_second)

        for (const submission of submissions.slice(0, 100)) {
            if (submission.result !== "AC") continue
            if (seenProblems.has(submission.problem_id)) continue
            seenProblems.add(submission.problem_id)

            problems.push({
                title: submission.problem_id.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
                problemSlug: submission.problem_id,
                difficulty: "Medium", // AtCoder difficulty requires separate API call
                url: `https://atcoder.jp/contests/${submission.contest_id}/tasks/${submission.problem_id}`,
                solvedAt: new Date(submission.epoch_second * 1000),
            })
        }

        return problems
    } catch (error) {
        console.error("Error fetching AtCoder data:", error)
        return []
    }
}

export async function validateAtCoderUsername(username: string): Promise<boolean> {
    try {
        const response = await fetchWithTimeout(
            `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${encodeURIComponent(username)}&from_second=0`
        )
        return response.ok
    } catch {
        return false
    }
}
