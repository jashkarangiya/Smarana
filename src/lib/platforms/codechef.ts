// CodeChef API Integration
// Uses third-party API: https://codechef-api.vercel.app/handle/{username}

import { PlatformProblem } from "./index"

interface CodeChefApiResponse {
    success: boolean
    profile?: string
    name?: string
    currentRating?: number
    highestRating?: number
    countryFlag?: string
    countryName?: string
    globalRank?: number
    countryRank?: number
    stars?: string
    heatMap?: Array<{ date: string; value: number }>
    // Note: This API may not return individual problems
}

export async function fetchCodeChefSolvedProblems(username: string): Promise<PlatformProblem[]> {
    if (!username) return []

    try {
        // The public CodeChef API is limited - it doesn't return individual problems
        // We'll validate the username and return empty for now
        // A full implementation would require scraping or a different API

        const response = await fetch(
            `https://codechef-api.vercel.app/handle/${encodeURIComponent(username)}`
        )

        if (!response.ok) {
            console.error("CodeChef API error:", response.status)
            return []
        }

        const data: CodeChefApiResponse = await response.json()

        if (!data.success) {
            console.error("CodeChef API: User not found")
            return []
        }

        // Unfortunately, this API doesn't provide solved problems list
        // Return empty array - the user exists but we can't fetch problems
        console.log(`CodeChef user ${username} found, but problem list not available via public API`)
        return []
    } catch (error) {
        console.error("Error fetching CodeChef data:", error)
        return []
    }
}

export async function validateCodeChefUsername(username: string): Promise<boolean> {
    try {
        const response = await fetch(
            `https://codechef-api.vercel.app/handle/${encodeURIComponent(username)}`
        )
        const data = await response.json()
        return data.success === true
    } catch {
        return false
    }
}
