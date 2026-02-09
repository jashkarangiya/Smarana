import {
    exchangeCode,
    fetchProblem,
    saveProblem as apiSaveProblem,
    saveAttempt as apiSaveAttempt,
    reviewProblem as apiReviewProblem,
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
                    tracked: false,
                    platform: message.platform,
                    slug: message.slug,
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
                    await clearStorage()
                    return {
                        tracked: false,
                        platform: message.platform,
                        slug: message.slug,
                        error: "NOT_AUTHENTICATED",
                    }
                }
                throw error
            }
        }

        case "SAVE_PROBLEM": {
            const accessToken = await getValidAccessToken()

            if (!accessToken) {
                return {
                    success: false,
                    error: "NOT_AUTHENTICATED",
                }
            }

            try {
                const response = await apiSaveProblem(accessToken, {
                    platform: message.platform,
                    slug: message.slug,
                    notes: message.notes,
                    solution: message.solution,
                })
                return response
            } catch (error) {
                if (error instanceof Error && error.message === "TOKEN_EXPIRED") {
                    await clearStorage()
                    return {
                        success: false,
                        error: "NOT_AUTHENTICATED",
                    }
                }
                throw error
            }
        }

        case "SAVE_ATTEMPT": {
            const accessToken = await getValidAccessToken()

            if (!accessToken) {
                return {
                    ok: false,
                    error: "NOT_AUTHENTICATED",
                }
            }

            try {
                const response = await apiSaveAttempt(accessToken, {
                    platform: message.platform,
                    platformKey: message.platformKey,
                    startedAt: message.startedAt,
                    endedAt: message.endedAt,
                    durationSec: message.durationSec,
                })
                return response
            } catch (error) {
                if (error instanceof Error && error.message === "TOKEN_EXPIRED") {
                    await clearStorage()
                    return {
                        ok: false,
                        error: "NOT_AUTHENTICATED",
                    }
                }
                throw error
            }
        }

        case "REVIEW_PROBLEM": {
            const accessToken = await getValidAccessToken()

            if (!accessToken) {
                return {
                    error: "NOT_AUTHENTICATED",
                }
            }

            try {
                const response = await apiReviewProblem(
                    accessToken,
                    message.platform,
                    message.slug,
                    message.rating,
                    {
                        timeSpentMs: message.timeSpentMs,
                        clientEventId: message.clientEventId,
                    }
                )
                return response
            } catch (error) {
                if (error instanceof Error && error.message === "TOKEN_EXPIRED") {
                    await clearStorage()
                    return {
                        error: "NOT_AUTHENTICATED",
                    }
                }
                throw error
            }
        }

        case "CONNECT": {
            const state = generateState()
            await storePendingState(state)

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
 * Handle external messages (from the web app after successful auth)
 */
chrome.runtime.onMessageExternal?.addListener(
    async (message, _sender, sendResponse) => {
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
 * Intercept navigation to the callback URL after auth
 * Only matches the production Smarana domain (no localhost in production)
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.url) {
        try {
            const url = new URL(tab.url)

            if (
                url.hostname === "smarana.vercel.app" &&
                url.pathname.includes("/extension/callback")
            ) {
                const code = url.searchParams.get("code")
                const state = url.searchParams.get("state")

                if (code && state) {
                    await handleAuthCallback(code, state, tabId)
                }
            }
        } catch {
            // Ignore invalid URLs
        }
    }
})

async function handleAuthCallback(code: string, state: string, tabId?: number) {
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
