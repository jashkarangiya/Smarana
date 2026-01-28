/**
 * Platform fetchers for verification
 * Each function fetches the public profile bio/about section
 */

// Supported platforms
export type Platform = "leetcode" | "codeforces" | "codechef" | "atcoder"

export interface PlatformProfileData {
    bio: string | null
    username: string
    exists: boolean
    error?: string
}

/**
 * Generate a unique verification token
 * Format: smarana-verify-{8 random alphanumeric chars}
 */
export function generateVerificationToken(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)]
    }
    return `smarana-verify-${code}`
}

/**
 * Check if a verification token exists in the bio text
 */
export function checkTokenInBio(bio: string | null, token: string): boolean {
    if (!bio) return false
    return bio.toLowerCase().includes(token.toLowerCase())
}

/**
 * Fetch LeetCode user profile
 * Uses the public GraphQL API
 */
export async function fetchLeetCodeProfile(username: string): Promise<PlatformProfileData> {
    try {
        const query = `
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    profile {
                        aboutMe
                    }
                }
            }
        `

        const response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables: { username }
            })
        })

        if (!response.ok) {
            return { bio: null, username, exists: false, error: "Failed to fetch profile" }
        }

        const data = await response.json()
        const user = data.data?.matchedUser

        if (!user) {
            return { bio: null, username, exists: false, error: "User not found" }
        }

        return {
            bio: user.profile?.aboutMe || null,
            username: user.username,
            exists: true
        }
    } catch (error) {
        return { bio: null, username, exists: false, error: String(error) }
    }
}

/**
 * Fetch Codeforces user profile
 * Uses the official API
 */
export async function fetchCodeforcesProfile(username: string): Promise<PlatformProfileData> {
    try {
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`)

        if (!response.ok) {
            return { bio: null, username, exists: false, error: "Failed to fetch profile" }
        }

        const data = await response.json()

        if (data.status !== "OK" || !data.result?.[0]) {
            return { bio: null, username, exists: false, error: "User not found" }
        }

        const user = data.result[0]
        // Codeforces doesn't have a bio field in API, but has organization, city, etc.
        // We'll need to scrape the profile page for bio
        // For now, check if they can add to their "organization" field

        // Attempt to scrape the profile page for bio
        const profilePage = await fetch(`https://codeforces.com/profile/${username}`)
        if (profilePage.ok) {
            const html = await profilePage.text()
            // Look for user-contributed bio (usually in organization field or blog)
            // Codeforces has limited bio options, so we check organization
            const orgMatch = html.match(/<div class="user-rank">[^<]*<\/div>\s*<div>([^<]*)<\/div>/)

            return {
                bio: user.organization || orgMatch?.[1] || null,
                username: user.handle,
                exists: true
            }
        }

        return {
            bio: user.organization || null,
            username: user.handle,
            exists: true
        }
    } catch (error) {
        return { bio: null, username, exists: false, error: String(error) }
    }
}

/**
 * Fetch CodeChef user profile
 * Scrapes the public profile page
 */
export async function fetchCodeChefProfile(username: string): Promise<PlatformProfileData> {
    try {
        const response = await fetch(`https://www.codechef.com/users/${username}`)

        if (!response.ok) {
            return { bio: null, username, exists: false, error: "Failed to fetch profile" }
        }

        const html = await response.text()

        // Check if user exists
        if (html.includes("Handle not found")) {
            return { bio: null, username, exists: false, error: "User not found" }
        }

        // CodeChef has a bio section - try to extract it
        // Look for the motto/bio section
        const bioMatch = html.match(/<span class="user-motto">([^<]*)<\/span>/)

        return {
            bio: bioMatch?.[1] || null,
            username,
            exists: true
        }
    } catch (error) {
        return { bio: null, username, exists: false, error: String(error) }
    }
}

/**
 * Fetch AtCoder user profile
 * Scrapes the public profile page
 */
export async function fetchAtCoderProfile(username: string): Promise<PlatformProfileData> {
    try {
        const response = await fetch(`https://atcoder.jp/users/${username}`)

        if (!response.ok) {
            return { bio: null, username, exists: false, error: "Failed to fetch profile" }
        }

        const html = await response.text()

        // Check if user exists
        if (html.includes("404 Not Found") || response.status === 404) {
            return { bio: null, username, exists: false, error: "User not found" }
        }

        // AtCoder has an affiliation field that users can edit
        const affiliationMatch = html.match(/<th>Affiliation<\/th>\s*<td[^>]*>([^<]*)<\/td>/)
        // Also check bio/country which may be editable
        const bioMatch = html.match(/<th>Bio<\/th>\s*<td[^>]*>([^<]*)<\/td>/)

        return {
            bio: bioMatch?.[1] || affiliationMatch?.[1] || null,
            username,
            exists: true
        }
    } catch (error) {
        return { bio: null, username, exists: false, error: String(error) }
    }
}

/**
 * Main function to fetch profile based on platform
 */
export async function fetchPlatformProfile(platform: Platform, username: string): Promise<PlatformProfileData> {
    switch (platform) {
        case "leetcode":
            return fetchLeetCodeProfile(username)
        case "codeforces":
            return fetchCodeforcesProfile(username)
        case "codechef":
            return fetchCodeChefProfile(username)
        case "atcoder":
            return fetchAtCoderProfile(username)
        default:
            return { bio: null, username, exists: false, error: "Unsupported platform" }
    }
}

/**
 * Platform-specific instructions for where to add the verification token
 */
export const PLATFORM_INSTRUCTIONS: Record<Platform, { field: string; steps: string[] }> = {
    leetcode: {
        field: "About Me",
        steps: [
            "Go to leetcode.com/profile/",
            "Click 'Edit Profile'",
            "Find the 'About Me' section",
            "Paste the verification code anywhere in your bio",
            "Click 'Save'"
        ]
    },
    codeforces: {
        field: "Organization",
        steps: [
            "Go to codeforces.com/settings/social",
            "Find the 'Organization' field",
            "Paste the verification code",
            "Click 'Save'"
        ]
    },
    codechef: {
        field: "Motto",
        steps: [
            "Go to codechef.com/users/edit",
            "Find the 'Motto' field",
            "Paste the verification code",
            "Click 'Update'"
        ]
    },
    atcoder: {
        field: "Affiliation",
        steps: [
            "Go to atcoder.jp/settings",
            "Find the 'Affiliation' field",
            "Paste the verification code",
            "Click 'Save'"
        ]
    }
}
