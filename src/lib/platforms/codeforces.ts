// Codeforces API Integration
// Public API: https://codeforces.com/api/user.status?handle={username}

import { PlatformProblem } from "./index"
import { fetchWithTimeout, fetchWithRetry } from "@/lib/fetch-utils"

interface CodeforcesSubmission {
    id: number
    contestId: number
    problem: {
        contestId: number
        index: string
        name: string
        rating?: number
        tags: string[]
    }
    verdict: string
    creationTimeSeconds: number
}

interface CodeforcesApiResponse {
    status: string
    result?: CodeforcesSubmission[]
    comment?: string
}

function getDifficultyFromRating(rating?: number): string {
    if (!rating) return "Medium"
    if (rating <= 1200) return "Easy"
    if (rating <= 1600) return "Medium"
    return "Hard"
}

export async function fetchCodeforcesSolvedProblems(username: string): Promise<PlatformProblem[]> {
    if (!username) return []

    try {
        const response = await fetchWithRetry(
            `https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}&from=1&count=100`,
            {},
            2
        )

        if (!response.ok) {
            console.error("Codeforces API error:", response.status)
            return []
        }

        const data: CodeforcesApiResponse = await response.json()

        if (data.status !== "OK" || !data.result) {
            console.error("Codeforces API error:", data.comment)
            return []
        }

        // Filter to accepted submissions and deduplicate by problem
        const seenProblems = new Set<string>()
        const problems: PlatformProblem[] = []

        for (const submission of data.result) {
            if (submission.verdict !== "OK") continue

            const problemKey = `${submission.problem.contestId}-${submission.problem.index}`
            if (seenProblems.has(problemKey)) continue
            seenProblems.add(problemKey)

            problems.push({
                title: submission.problem.name,
                problemSlug: problemKey,
                difficulty: getDifficultyFromRating(submission.problem.rating),
                url: `https://codeforces.com/contest/${submission.problem.contestId}/problem/${submission.problem.index}`,
                solvedAt: new Date(submission.creationTimeSeconds * 1000),
            })
        }

        return problems
    } catch (error) {
        console.error("Error fetching Codeforces data:", error)
        return []
    }
}

export async function validateCodeforcesUsername(username: string): Promise<boolean> {
    try {
        const response = await fetchWithTimeout(
            `https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`
        )
        const data = await response.json()
        return data.status === "OK"
    } catch {
        return false
    }
}
