/**
 * Storage keys for the extension
 */
export const STORAGE_KEYS = {
    ACCESS_TOKEN: "smarana_access_token",
    REFRESH_TOKEN: "smarana_refresh_token",
    EXPIRES_AT: "smarana_expires_at",
    USER: "smarana_user",
    PENDING_STATE: "smarana_pending_state",
} as const

export interface StoredUser {
    username: string | null
    email: string | null
    image: string | null
    name: string | null
}

export interface StoredTokens {
    accessToken: string
    refreshToken: string
    expiresAt: string
}

/**
 * Store authentication tokens
 */
export async function storeTokens(tokens: StoredTokens): Promise<void> {
    await chrome.storage.local.set({
        [STORAGE_KEYS.ACCESS_TOKEN]: tokens.accessToken,
        [STORAGE_KEYS.REFRESH_TOKEN]: tokens.refreshToken,
        [STORAGE_KEYS.EXPIRES_AT]: tokens.expiresAt,
    })
}

/**
 * Store user info
 */
export async function storeUser(user: StoredUser): Promise<void> {
    await chrome.storage.local.set({
        [STORAGE_KEYS.USER]: user,
    })
}

/**
 * Get stored tokens
 */
export async function getTokens(): Promise<StoredTokens | null> {
    const result = await chrome.storage.local.get([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.EXPIRES_AT,
    ])

    const accessToken = result[STORAGE_KEYS.ACCESS_TOKEN]
    const refreshToken = result[STORAGE_KEYS.REFRESH_TOKEN]
    const expiresAt = result[STORAGE_KEYS.EXPIRES_AT]

    if (!accessToken || !refreshToken || !expiresAt) {
        return null
    }

    return { accessToken, refreshToken, expiresAt }
}

/**
 * Get stored user info
 */
export async function getUser(): Promise<StoredUser | null> {
    const result = await chrome.storage.local.get([STORAGE_KEYS.USER])
    return result[STORAGE_KEYS.USER] || null
}

/**
 * Clear all stored data (for logout)
 */
export async function clearStorage(): Promise<void> {
    await chrome.storage.local.remove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.EXPIRES_AT,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.PENDING_STATE,
    ])
}

/**
 * Store pending state for OAuth-like flow
 */
export async function storePendingState(state: string): Promise<void> {
    await chrome.storage.local.set({
        [STORAGE_KEYS.PENDING_STATE]: state,
    })
}

/**
 * Get and clear pending state
 */
export async function getPendingState(): Promise<string | null> {
    const result = await chrome.storage.local.get([STORAGE_KEYS.PENDING_STATE])
    const state = result[STORAGE_KEYS.PENDING_STATE] || null

    // Clear the state after retrieving
    if (state) {
        await chrome.storage.local.remove([STORAGE_KEYS.PENDING_STATE])
    }

    return state
}

/**
 * Check if the access token is expired or about to expire (within 5 minutes)
 */
export function isTokenExpired(expiresAt: string): boolean {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const fiveMinutes = 5 * 60 * 1000

    return expiry.getTime() - now.getTime() < fiveMinutes
}
