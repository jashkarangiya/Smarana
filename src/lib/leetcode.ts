// LeetCode GraphQL API Integration
// This uses LeetCode's public GraphQL endpoint to fetch real user data

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

interface LeetCodeProblem {
    title: string
    titleSlug: string
    difficulty: string
    timestamp: string
}

interface RecentSubmission {
    title: string
    titleSlug: string
    timestamp: string
    statusDisplay: string
    lang: string
}

// Fetch user's recent accepted submissions
export async function fetchRecentSolvedProblems(username: string): Promise<LeetCodeProblem[]> {
    if (!username) {
        return []
    }

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
        const submissions = submissionsData.data?.recentAcSubmissionList || []

        if (submissions.length === 0) {
            return []
        }

        // Get problem details for each submission
        const problemsWithDetails: LeetCodeProblem[] = []
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
                        problemsWithDetails.push({
                            title: question.title,
                            titleSlug: question.titleSlug,
                            difficulty: question.difficulty,
                            timestamp: submission.timestamp,
                        })
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch details for ${submission.titleSlug}:`, err)
            }

            // Rate limit: small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        return problemsWithDetails
    } catch (error) {
        console.error("Error fetching LeetCode data:", error)
        return []
    }
}

// Fetch user profile stats
export async function fetchUserStats(username: string) {
    if (!username) {
        return null
    }

    try {
        const query = `
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            ranking
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
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

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        return data.data?.matchedUser || null
    } catch (error) {
        console.error("Error fetching user stats:", error)
        return null
    }
}
