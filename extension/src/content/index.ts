import { getProblemContext, type ProblemContext } from "../lib/platform"
import { onUrlChange } from "../lib/url-watcher"
import { getAuthStatus, getProblem, connect } from "../lib/messaging"
import { SmaranaOverlay } from "./overlay"

console.log("[Smarana] Content script loaded")

let currentContext: ProblemContext | null = null
let cleanupUrlWatcher: (() => void) | null = null
let overlay: SmaranaOverlay | null = null

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
            overlay?.destroy()
            overlay = null
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

    // Create overlay if not exists
    if (!overlay) {
        overlay = new SmaranaOverlay()
    }

    // Show loading state
    overlay.setLoading(context)

    // Fetch and render problem data
    await fetchAndRenderProblem(context)
}

/**
 * Fetch problem data and render the overlay
 */
import type { ProblemData } from "../lib/api"

/**
 * Fetch problem data and render the overlay
 */
async function fetchAndRenderProblem(context: ProblemContext) {
    if (!overlay) return

    try {
        const authStatus = await getAuthStatus()

        if (!authStatus.isAuthenticated) {
            overlay.setNotConnected(context, handleConnect)
            return
        }

        // Fetch problem data
        const response = await getProblem(context.platform, context.slug)

        if (response.error === "NOT_AUTHENTICATED") {
            overlay.setNotConnected(context, handleConnect)
            return
        }

        if (!response.tracked) {
            overlay.setNotTracked(context)
            return
        }

        // Map flat response to ProblemData
        // We know these fields exist because tracked is true
        const problemData: ProblemData = {
            id: response.id!,
            title: response.title!,
            difficulty: response.difficulty!,
            platform: response.platform,
            slug: response.slug,
            notes: response.notes!,
            url: response.url!,
            solution: response.solution || null,
            nextReviewAt: response.nextReviewAt || null,
            reviewCount: response.reviewCount || 0,
            interval: response.interval || 0,
            lastReviewedAt: response.lastReviewedAt || null,
            smaranaUrl: response.smaranaUrl!
        }

        overlay.setProblem(context, problemData, () => fetchAndRenderProblem(context))
    } catch (error) {
        console.error("[Smarana] Error fetching problem:", error)
        overlay.setError(
            context,
            error instanceof Error ? error.message : "Failed to load",
            () => fetchAndRenderProblem(context)
        )
    }
}

/**
 * Handle the connect button click
 */
async function handleConnect() {
    if (!overlay || !currentContext) return

    overlay.setLoading(currentContext)

    try {
        await connect()
        // The connect flow will open a new tab
        // When the user completes it, the background script will notify us
    } catch (error) {
        console.error("[Smarana] Connect error:", error)
        if (overlay && currentContext) {
            overlay.setNotConnected(currentContext, handleConnect)
        }
    }
}

/**
 * Listen for auth success from background
 */
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "AUTH_SUCCESS") {
        console.log("[Smarana] Auth success received")
        // Re-check the current page to fetch problem data
        if (currentContext && overlay) {
            fetchAndRenderProblem(currentContext)
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
    overlay?.destroy()
})
