import type { Platform } from "./platform"

// Use localhost in development, production URL otherwise
const API_BASE_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://smarana.vercel.app"

export interface ProblemData {
    id: string
    title: string
    difficulty: string
    platform: string
    slug: string
    notes: string
    url: string
    solution: string | null
    nextReviewAt: string | null
    reviewCount: number
    interval: number
    lastReviewedAt: string | null
    smaranaUrl: string
}

export interface ProblemResponse {
    tracked: boolean
    platform: string
    slug: string

    // Problem fields (present if tracked is true)
    id?: string
    title?: string
    difficulty?: string
    url?: string
    notes?: string
    solution?: string | null
    nextReviewAt?: string | null
    reviewCount?: number
    interval?: number
    lastReviewedAt?: string | null
    smaranaUrl?: string

    error?: string // For potential error handling
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
    expiresAt: string
    user?: {
        username: string | null
        email: string | null
    }
}

export interface RefreshResponse {
    accessToken: string
    expiresAt: string
}

/**
 * Exchange an authorization code for tokens
 */
export async function exchangeCode(code: string): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/api/extension/auth/exchange`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
    })

    if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to exchange code")
    }

    return response.json()
}

/**
 * Refresh an access token using a refresh token
 */
export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const response = await fetch(`${API_BASE_URL}/api/extension/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to refresh token")
    }

    return response.json()
}

/**
 * Fetch problem data from the Smarana API
 */
export async function fetchProblem(
    accessToken: string,
    platform: Platform,
    slug: string
): Promise<ProblemResponse> {
    const params = new URLSearchParams({ platform, slug })
    const response = await fetch(`${API_BASE_URL}/api/extension/problem?${params}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (response.status === 401) {
        throw new Error("TOKEN_EXPIRED")
    }

    if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch problem")
    }

    return response.json()
}

/**
 * Build the Smarana connect URL
 */
export function getConnectUrl(state: string): string {
    return `${API_BASE_URL}/extension/connect?state=${encodeURIComponent(state)}`
}

/**
 * Generate a random state string for OAuth-like flow
 */
export function generateState(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
