import { getProblemContext, type ProblemContext } from "../lib/platform"
import { onUrlChange } from "../lib/url-watcher"
import { getProblem, saveProblem, connect } from "../lib/messaging"
import { SmaranaOverlay } from "./overlay"
import type { ProblemData } from "../lib/api"
import { getAuth, onAuthChanged } from "../lib/auth-store"

console.log("[Smarana] Content script loaded")

let currentContext: ProblemContext | null = null
let cleanupUrlWatcher: (() => void) | null = null
let cleanupAuth: (() => void) | null = null
let overlay: SmaranaOverlay | null = null
let currentAbort: AbortController | null = null

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

    // Watch for Auth changes
    cleanupAuth = onAuthChanged((auth) => {
        console.log("[Smarana] Auth changed:", auth ? "Logged In" : "Logged Out")

        // If we are currently on a problem page, update the UI
        const context = getProblemContext(location.href)
        // If we're not on a tracked page, or overlay isn't active, do nothing
        if (!context || !overlay) return

        if (!auth) {
            // Logged out -> Immediately show connect
            if (currentAbort) currentAbort.abort()
            overlay.showConnect(context)
        } else {
            // Logged in -> Immediately fetch
            fetchAndRenderProblem(context, auth)
        }
    })
}

/**
 * Check the current page and update the overlay
 */
async function checkCurrentPage() {
    const context = getProblemContext(location.href)

    // If we're not on a problem page, remove the overlay
    if (!context) {
        console.log("[Smarana] No problem context found for URL:", location.href)
        if (currentContext) {
            console.log("[Smarana] Left problem page, removing overlay")
            overlay?.destroy()
            overlay = null
            currentContext = null
        }
        return
    }

    console.log("[Smarana] Detected problem:", context)
    currentContext = context

    // Create overlay if not exists
    if (!overlay) {
        console.log("[Smarana] Creating new overlay instance")
        overlay = new SmaranaOverlay()
    }

    // Check Auth
    const auth = await getAuth()
    if (!auth) {
        console.log("[Smarana] Not authenticated, showing connect UI")
        overlay.showConnect(context)
        return
    }

    // Authenticated -> Fetch
    await fetchAndRenderProblem(context, auth)
}

async function fetchAndRenderProblem(context: ProblemContext, auth: any) {
    if (!overlay) return

    if (currentAbort) currentAbort.abort()
    currentAbort = new AbortController()

    console.log("[Smarana] Fetching problem data...", context)
    overlay.setLoading(context) // Show loading state on the overlay

    try {
        const data = await getProblem(context.platform, context.slug)
        console.log("[Smarana] Problem data received:", data)

        if (!data.tracked) {
            overlay.setNotTracked(context)
            return
        }

        const problemData: ProblemData = {
            id: data.id!,
            title: data.title!,
            difficulty: data.difficulty!,
            platform: data.platform,
            slug: data.slug,
            notes: data.notes || "",
            url: data.url!,
            solution: data.solution || null,
            nextReviewAt: data.nextReviewAt || null,
            reviewCount: data.reviewCount || 0,
            interval: data.interval || 0,
            lastReviewedAt: data.lastReviewedAt || null,
            smaranaUrl: data.smaranaUrl!
        }

        // Create save handler
        const handleSave = async (notes: string, solution: string): Promise<boolean> => {
            try {
                const result = await saveProblem(context.platform, context.slug, notes, solution)
                return result.success
            } catch (error) {
                console.error("[Smarana] Save error:", error)
                return false
            }
        }

        const handleRefresh = () => fetchAndRenderProblem(context, auth)

        overlay.setProblem(context, problemData, handleRefresh, handleSave)
    } catch (err: any) {
        if (err.name === "AbortError") return

        console.error("[Smarana] Error fetching problem:", err)

        // If 401/403, we could optimize to showConnect, but auth listener should handle it if store updates.
        // For now just show error.
        overlay.setError(context, "Failed to load problem data.", () => fetchAndRenderProblem(context, auth))
    }
}

// Initialize immediately
init()

// Clean up
window.addEventListener("unload", () => {
    if (cleanupUrlWatcher) cleanupUrlWatcher()
    if (cleanupAuth) cleanupAuth()
    overlay?.destroy()
})
