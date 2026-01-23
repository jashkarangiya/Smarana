// LeetCode GraphQL API Integration
// Moved to platforms folder for unified interface

import { PlatformProblem } from "./index"

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

interface LeetCodeSubmission {
    title: string
    titleSlug: string
    timestamp: string
}

export async function fetchLeetCodeSolvedProblems(username: string): Promise<PlatformProblem[]> {
    if (!username) return []

    try {
        // First, get recent submissions
        const recentSubmissionsQuery = `
            query recentAcSubmissions($username: String!, $limit: Int!) {
                recentAcSubmissionList(username: $username, limit: $limit) {
                    title
                    titleSlug
                    timestamp
                }
            }
        `

        const submissionsResponse = await fetch(LEETCODE_GRAPHQL_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://leetcode.com",
            },
            body: JSON.stringify({
                query: recentSubmissionsQuery,
                variables: { username, limit: 20 },
            }),
        })

        if (!submissionsResponse.ok) {
            console.error("LeetCode API error:", submissionsResponse.status)
            return []
        }

        const submissionsData = await submissionsResponse.json()
        const submissions: LeetCodeSubmission[] = submissionsData.data?.recentAcSubmissionList || []

        if (submissions.length === 0) {
            return []
        }

        // Get problem details for each submission
        const problems: PlatformProblem[] = []
        const seenSlugs = new Set<string>()

        for (const submission of submissions) {
            if (seenSlugs.has(submission.titleSlug)) continue
            seenSlugs.add(submission.titleSlug)

            // Fetch problem difficulty
            const problemQuery = `
                query questionData($titleSlug: String!) {
                    question(titleSlug: $titleSlug) {
                        title
                        titleSlug
                        difficulty
                    }
                }
            `

            try {
                const problemResponse = await fetch(LEETCODE_GRAPHQL_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Referer": "https://leetcode.com",
                    },
                    body: JSON.stringify({
                        query: problemQuery,
                        variables: { titleSlug: submission.titleSlug },
                    }),
                })

                if (problemResponse.ok) {
                    const problemData = await problemResponse.json()
                    const question = problemData.data?.question

                    if (question) {
                        problems.push({
                            title: question.title,
                            problemSlug: question.titleSlug,
                            difficulty: question.difficulty,
                            url: `https://leetcode.com/problems/${question.titleSlug}/`,
                            solvedAt: new Date(parseInt(submission.timestamp) * 1000),
                        })
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch details for ${submission.titleSlug}:`, err)
            }

            // Rate limit: small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        return problems
    } catch (error) {
        console.error("Error fetching LeetCode data:", error)
        return []
    }
}

export async function validateLeetCodeUsername(username: string): Promise<boolean> {
    if (!username) return false

    try {
        const query = `
            query userPublicProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                }
            }
        `

        const response = await fetch(LEETCODE_GRAPHQL_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://leetcode.com",
            },
            body: JSON.stringify({
                query,
                variables: { username },
            }),
        })

        if (!response.ok) return false

        const data = await response.json()
        return !!data.data?.matchedUser
    } catch {
        return false
    }
}
