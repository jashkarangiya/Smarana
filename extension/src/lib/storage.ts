export * from "./auth-store"
import { getAuth, setAuth, clearAuth } from "./auth-store"

// Backward compatibility helpers if needed, but better to use auth-store directly.
// For now, we will leave this file as a re-export to minimize breakage if other files import from here,
// but we will update the main consumers to use auth-store or this file's new exports.

// Re-implement legacy functions using new store to avoid breaking background instantly
export async function storeTokens(tokens: any): Promise<void> {
    const current = await getAuth() || {} as any
    await setAuth({ ...current, ...tokens })
}

export async function storeUser(user: any): Promise<void> {
    const current = await getAuth() || {} as any
    await setAuth({ ...current, user })
}

export async function getTokens(): Promise<any | null> {
    const auth = await getAuth()
    if (!auth) return null
    return {
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        expiresAt: auth.expiresAt
    }
}

export async function getUser(): Promise<any | null> {
    const auth = await getAuth()
    return auth?.user || null
}

export { clearAuth as clearStorage }

export const STORAGE_KEYS = {
    // Keep this for pending state which checks match
    PENDING_STATE: "smarana_pending_state",
}

export async function storePendingState(state: string): Promise<void> {
    await chrome.storage.local.set({
        [STORAGE_KEYS.PENDING_STATE]: state,
    })
}

export async function getPendingState(): Promise<string | null> {
    const result = await chrome.storage.local.get([STORAGE_KEYS.PENDING_STATE])
    const state = result[STORAGE_KEYS.PENDING_STATE] || null
    if (state) {
        await chrome.storage.local.remove([STORAGE_KEYS.PENDING_STATE])
    }
    return state
}

export function isTokenExpired(expiresAt: string): boolean {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const oneMinute = 60 * 1000
    return expiry.getTime() - now.getTime() < oneMinute
}
