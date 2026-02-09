export const AUTH_KEY = "smarana.auth"

export type SmaranaAuth = {
    accessToken: string
    refreshToken: string
    expiresAt: string // ISO string
    user?: {
        username: string | null
        email: string | null
        image: string | null
        name: string | null
    }
}

/**
 * Get the current auth state from storage
 */
export async function getAuth(): Promise<SmaranaAuth | null> {
    let data: Record<string, any> = {}
    try {
        data = await chrome.storage.local.get(AUTH_KEY)
    } catch {
        return null
    }
    const auth = data[AUTH_KEY] as SmaranaAuth | undefined

    if (!auth?.accessToken) return null

    // Check expiry
    if (auth.expiresAt) {
        const expiry = new Date(auth.expiresAt).getTime()
        const now = Date.now()
        // Provide a 1-minute buffer
        if (now > expiry - 60000) {
            await clearAuth()
            return null
        }
    }

    return auth
}

/**
 * Save auth state to storage
 */
export async function setAuth(auth: SmaranaAuth) {
    try {
        await chrome.storage.local.set({ [AUTH_KEY]: auth })
    } catch {
        // Ignore if context invalidated
    }
}

/**
 * Clear auth state from storage
 */
export async function clearAuth() {
    try {
        await chrome.storage.local.remove(AUTH_KEY)
    } catch {
        // Ignore if context invalidated
    }
}

/**
 * Listen for auth changes
 */
export function onAuthChanged(cb: (auth: SmaranaAuth | null) => void) {
    const handler = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
        if (area !== "local") return
        if (!changes[AUTH_KEY]) return

        const newValue = changes[AUTH_KEY].newValue as SmaranaAuth | undefined
        cb(newValue || null)
    }
    try {
        chrome.storage.onChanged.addListener(handler)
    } catch {
        return () => undefined
    }
    return () => {
        try {
            chrome.storage.onChanged.removeListener(handler)
        } catch {
            // Ignore
        }
    }
}
