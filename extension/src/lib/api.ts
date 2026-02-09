import type { Platform } from "./platform"

// Use localhost in development, production URL otherwise
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.MODE === "development"
        ? "http://localhost:3000"
        : "https://smarana.vercel.app")

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
        image: string | null
        name: string | null
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

export interface SaveProblemRequest {
    platform: string
    slug: string
    notes?: string
    solution?: string
}

export interface SaveProblemResponse {
    success: boolean
    error?: string
}

export type AttemptPayload = {
    platform: string
    platformKey: string
    startedAt: string
    endedAt: string
    durationSec: number
}

export type PerformanceNudge = {
    title: string
    body: string
    tone: "success" | "neutral" | "encourage"
}

export interface SaveAttemptResponse {
    ok: boolean
    nudge?: PerformanceNudge
    error?: string
}

export interface ReviewProblemResponse {
    problem?: any
    xpEarned?: number
    achievementBonusXP?: number
    newAchievements?: string[]
    error?: string
}

async function safeParseJson(response: Response) {
    const text = await response.text()
    if (!text) return null
    try {
        return JSON.parse(text)
    } catch {
        return null
    }
}

/**
 * Save notes and/or solution for a problem
 */
export async function saveProblem(
    accessToken: string,
    data: SaveProblemRequest
): Promise<SaveProblemResponse> {
    const response = await fetch(`${API_BASE_URL}/api/extension/problem`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    })

    if (response.status === 401) {
        throw new Error("TOKEN_EXPIRED")
    }

    if (!response.ok) {
        const data = await safeParseJson(response)
        throw new Error(data?.error || "Failed to save problem")
    }

    const payload = await safeParseJson(response)
    return (payload || { success: true }) as SaveProblemResponse
}

/**
 * Save an attempt for a problem (time spent)
 */
export async function saveAttempt(
    accessToken: string,
    data: AttemptPayload
): Promise<SaveAttemptResponse> {
    const response = await fetch(`${API_BASE_URL}/api/extension/attempt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    })

    if (response.status === 401) {
        throw new Error("TOKEN_EXPIRED")
    }

    if (!response.ok) {
        const payload = await safeParseJson(response)
        throw new Error(payload?.error || "Failed to save attempt")
    }

    const payload = await safeParseJson(response)
    return (payload || { ok: true }) as SaveAttemptResponse
}

/**
 * Mark a problem as reviewed
 */
export async function reviewProblem(
    accessToken: string,
    platform: string,
    slug: string,
    rating?: number,
    meta?: { timeSpentMs?: number; clientEventId?: string }
): Promise<ReviewProblemResponse> {
    const payloadBody = JSON.stringify({
        platform,
        slug,
        rating,
        timeSpentMs: meta?.timeSpentMs,
        clientEventId: meta?.clientEventId,
    })
    let response = await fetch(`${API_BASE_URL}/api/extension/problem/review`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: payloadBody,
    })

    if (!response.ok && API_BASE_URL.includes("smarana.vercel.app")) {
        response = await fetch(`http://localhost:3000/api/extension/problem/review`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: payloadBody,
        })
    }

    if (response.status === 401) {
        throw new Error("TOKEN_EXPIRED")
    }

    if (!response.ok) {
        const payload = await safeParseJson(response)
        const detail = payload?.error || `HTTP ${response.status}`
        throw new Error(`Failed to review problem (${detail})`)
    }

    const payload = await safeParseJson(response)
    return (payload || {}) as ReviewProblemResponse
}
