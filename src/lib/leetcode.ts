export interface LeetCodeProblem {
    slug: string
    title: string
    difficulty: "Easy" | "Medium" | "Hard"
    url: string
    timestamp: Date
}

export async function fetchRecentSolvedProblems(
    username: string
): Promise<LeetCodeProblem[]> {
    // TODO: Replace with real API or usage of unofficial API wrapper.
    // For now, returning mock data to unblock development.
    console.log(`Fetching problems for ${username}...`)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockProblems: LeetCodeProblem[] = [
        {
            slug: "two-sum",
            title: "Two Sum",
            difficulty: "Easy",
            url: "https://leetcode.com/problems/two-sum/",
            timestamp: new Date(),
        },
        {
            slug: "add-two-numbers",
            title: "Add Two Numbers",
            difficulty: "Medium",
            url: "https://leetcode.com/problems/add-two-numbers/",
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
        },
        {
            slug: "median-of-two-sorted-arrays",
            title: "Median of Two Sorted Arrays",
            difficulty: "Hard",
            url: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
            timestamp: new Date(Date.now() - 172800000), // 2 days ago
        },
    ]

    return mockProblems
}
