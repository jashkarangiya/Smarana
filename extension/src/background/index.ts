import {
    exchangeCode,
    fetchProblem,
    refreshToken as apiRefreshToken,
    generateState,
    getConnectUrl,
} from "../lib/api"
import {
    storeTokens,
    storeUser,
    getTokens,
    getUser,
    clearStorage,
    storePendingState,
    getPendingState,
    isTokenExpired,
} from "../lib/storage"
import type { MessageType, MessageResponse } from "../lib/messaging"
import type { Platform } from "../lib/platform"

console.log("[Smarana] Background service worker started")

/**
 * Get a valid access token, refreshing if necessary
 */
async function getValidAccessToken(): Promise<string | null> {
    const tokens = await getTokens()

    if (!tokens) {
        return null
    }

    // Check if token is expired or about to expire
    if (isTokenExpired(tokens.expiresAt)) {
        console.log("[Smarana] Token expired, refreshing...")
        try {
            const refreshed = await apiRefreshToken(tokens.refreshToken)
            await storeTokens({
                accessToken: refreshed.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: refreshed.expiresAt,
            })
            return refreshed.accessToken
        } catch (error) {
            console.error("[Smarana] Failed to refresh token:", error)
            // Clear invalid tokens
            await clearStorage()
            return null
        }
    }

    return tokens.accessToken
}

/**
 * Handle messages from content script and popup
 */
chrome.runtime.onMessage.addListener(
    (message: MessageType, _sender, sendResponse: (response: MessageResponse) => void) => {
        handleMessage(message)
            .then(sendResponse)
            .catch((error) => {
                console.error("[Smarana] Message handler error:", error)
                sendResponse({ success: false, error: error.message })
            })

        // Return true to indicate we will send a response asynchronously
        return true
    }
)

async function handleMessage(message: MessageType): Promise<MessageResponse> {
    switch (message.type) {
        case "GET_AUTH_STATUS": {
            const tokens = await getTokens()
            const user = await getUser()

            if (!tokens) {
                return { isAuthenticated: false }
            }

            // Verify token is valid by checking expiry
            // We don't refresh here to avoid unnecessary API calls
            const isValid = !isTokenExpired(tokens.expiresAt)

            return {
                isAuthenticated: isValid,
                user: user || undefined,
            }
        }

        case "GET_PROBLEM": {
            const accessToken = await getValidAccessToken()

            if (!accessToken) {
                return {
                    found: false,
                    problem: null,
                    error: "NOT_AUTHENTICATED",
                }
            }

            try {
                const response = await fetchProblem(
                    accessToken,
                    message.platform as Platform,
                    message.slug
                )
                return response
            } catch (error) {
                if (error instanceof Error && error.message === "TOKEN_EXPIRED") {
                    // Token refresh failed, clear storage
                    await clearStorage()
                    return {
                        found: false,
                        problem: null,
                        error: "NOT_AUTHENTICATED",
                    }
                }
                throw error
            }
        }

        case "CONNECT": {
            // Generate a state parameter for security
            const state = generateState()
            await storePendingState(state)

            // Open the connect page in a new tab
            const connectUrl = getConnectUrl(state)
            await chrome.tabs.create({ url: connectUrl })

            return { success: true }
        }

        case "DISCONNECT": {
            await clearStorage()
            return { success: true }
        }

        default:
            return { success: false, error: "Unknown message type" }
    }
}

/**
 * Listen for navigation to our callback URL
 * The web app redirects to smarana-extension://callback?code=...
 * But since we can't register a custom protocol, we'll handle this differently
 */

// Instead, we'll listen for when the connect page sends us a code
// This is done through a content script on our own domain, or through
// the popup polling for changes

/**
 * Handle external messages (from the web app after successful auth)
 * This requires adding the extension ID to web_accessible_resources
 */
chrome.runtime.onMessageExternal?.addListener(
    async (message, sender, sendResponse) => {
        console.log("[Smarana] External message received:", message, sender)

        if (message.type === "AUTH_CALLBACK" && message.code) {
            try {
                const result = await exchangeCode(message.code)

                await storeTokens({
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresAt: result.expiresAt,
                })

                if (result.user) {
                    await storeUser(result.user)
                }

                sendResponse({ success: true })
            } catch (error) {
                console.error("[Smarana] Code exchange failed:", error)
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                })
            }
        }

        return true
    }
)

/**
 * Alternative approach: Poll for URL changes in tabs
 * When the connect page shows success and includes a code in the URL,
 * we can intercept it
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.url) {
        // Check if this is the callback URL
        const url = new URL(tab.url)

        // Handle smarana-extension:// protocol (if registered)
        if (url.protocol === "smarana-extension:") {
            const code = url.searchParams.get("code")
            const state = url.searchParams.get("state")

            if (code && state) {
                await handleAuthCallback(code, state, tabId)
            }
        }

        // Also handle if the web app embeds the code in a success page URL
        // This is a fallback approach
        if (
            (url.hostname === "smarana.vercel.app" || url.hostname === "localhost") &&
            url.pathname.includes("/extension/callback")
        ) {
            const code = url.searchParams.get("code")
            const state = url.searchParams.get("state")

            if (code && state) {
                await handleAuthCallback(code, state, tabId)
            }
        }
    }
})

async function handleAuthCallback(code: string, state: string, tabId?: number) {
    console.log("[Smarana] Handling auth callback")

    // Verify state matches
    const pendingState = await getPendingState()
    if (pendingState && pendingState !== state) {
        console.error("[Smarana] State mismatch, ignoring callback")
        return
    }

    try {
        const result = await exchangeCode(code)

        await storeTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt: result.expiresAt,
        })

        if (result.user) {
            await storeUser(result.user)
        }

        console.log("[Smarana] Successfully authenticated")

        // Close the tab that handled the auth
        if (tabId) {
            try {
                await chrome.tabs.remove(tabId)
            } catch {
                // Tab might already be closed
            }
        }

        // Notify any open popups or content scripts
        chrome.runtime.sendMessage({ type: "AUTH_SUCCESS" }).catch(() => {
            // Ignore errors if no listeners
        })
    } catch (error) {
        console.error("[Smarana] Code exchange failed:", error)
    }
}
