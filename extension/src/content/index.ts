import { getProblemContext } from "../lib/platform"
import { onUrlChange } from "../lib/url-watcher"
import { getAuthStatus, getProblem, connect } from "../lib/messaging"
import { createOverlay, updateOverlay, removeOverlay, type OverlayState } from "./overlay"

console.log("[Smarana] Content script loaded")

let currentContext: { platform: string; slug: string } | null = null
let cleanupUrlWatcher: (() => void) | null = null

/**
 * Initialize the content script
 */
async function init() {
    // Check the current URL
    await checkCurrentPage()

    // Watch for URL changes (SPA navigation)
    cleanupUrlWatcher = onUrlChange(async () => {
        await checkCurrentPage()
    })
}

/**
 * Check the current page and update the overlay
 */
async function checkCurrentPage() {
    const context = getProblemContext(location.href)

    // If we're not on a problem page, remove the overlay
    if (!context) {
        if (currentContext) {
            console.log("[Smarana] Left problem page, removing overlay")
            removeOverlay()
            currentContext = null
        }
        return
    }

    // If we're on the same problem, no need to update
    if (
        currentContext &&
        currentContext.platform === context.platform &&
        currentContext.slug === context.slug
    ) {
        return
    }

    console.log("[Smarana] Detected problem:", context)
    currentContext = context

    // Create or update the overlay
    createOverlay()

    // Show loading state
    updateOverlay({
        type: "loading",
    })

    // Check auth status and fetch problem data
    try {
        const authStatus = await getAuthStatus()

        if (!authStatus.isAuthenticated) {
            updateOverlay({
                type: "not-connected",
                onConnect: handleConnect,
            })
            return
        }

        // Fetch problem data
        const response = await getProblem(context.platform, context.slug)

        if (response.error === "NOT_AUTHENTICATED") {
            updateOverlay({
                type: "not-connected",
                onConnect: handleConnect,
            })
            return
        }

        if (!response.found || !response.problem) {
            updateOverlay({
                type: "not-tracked",
                platform: context.platform,
                slug: context.slug,
            })
            return
        }

        updateOverlay({
            type: "problem",
            problem: response.problem,
        })
    } catch (error) {
        console.error("[Smarana] Error fetching problem:", error)
        updateOverlay({
            type: "error",
            message: error instanceof Error ? error.message : "Failed to load",
        })
    }
}

/**
 * Handle the connect button click
 */
async function handleConnect() {
    updateOverlay({ type: "loading" })

    try {
        await connect()
        // The connect flow will open a new tab
        // When the user completes it, the background script will notify us
    } catch (error) {
        console.error("[Smarana] Connect error:", error)
        updateOverlay({
            type: "not-connected",
            onConnect: handleConnect,
        })
    }
}

/**
 * Listen for auth success from background
 */
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "AUTH_SUCCESS") {
        console.log("[Smarana] Auth success received")
        // Re-check the current page to fetch problem data
        if (currentContext) {
            checkCurrentPage()
        }
    }
})

// Initialize when the page loads
init()

// Clean up on unload
window.addEventListener("beforeunload", () => {
    if (cleanupUrlWatcher) {
        cleanupUrlWatcher()
    }
})
