import { getProblemContext, type ProblemContext } from "../lib/platform"
import { onUrlChange } from "../lib/url-watcher"
import { getProblem, saveProblem, reviewProblem } from "../lib/messaging"
import { SmaranaOverlay } from "./overlay"
import type { ProblemData } from "../lib/api"
import { getAuth, onAuthChanged, clearAuth } from "../lib/auth-store"

let currentContext: ProblemContext | null = null
let cleanupUrlWatcher: (() => void) | null = null
let cleanupAuth: (() => void) | null = null
let overlay: SmaranaOverlay | null = null
let currentAbort: AbortController | null = null

class ReviewTimer {
    private running = false
    private startedAt = 0
    private acc = 0

    start() {
        if (this.running) return
        this.running = true
        this.startedAt = performance.now()
    }

    pause() {
        if (!this.running) return
        this.acc += performance.now() - this.startedAt
        this.running = false
    }

    reset() {
        this.running = false
        this.acc = 0
        this.startedAt = 0
    }

    elapsedMs() {
        return Math.round(this.running ? this.acc + (performance.now() - this.startedAt) : this.acc)
    }

    isRunning() {
        return this.running
    }
}

type TimerState = {
    seconds: number
    intervalId: number | null
    enabled: boolean
    running: boolean
}

const timerState: TimerState = {
    seconds: 0,
    intervalId: null,
    enabled: false,
    running: false,
}

const reviewTimer = new ReviewTimer()
let overlayOpen = false
let isSubmittingReview = false

function canCountActiveTime() {
    return document.visibilityState === "visible" && document.hasFocus()
}

function startTimerInterval() {
    if (timerState.intervalId != null) return
    timerState.intervalId = window.setInterval(() => {
        if (!timerState.enabled) return
        const elapsedMs = reviewTimer.elapsedMs()
        timerState.seconds = Math.floor(elapsedMs / 1000)
        updateTimerUI()
    }, 1000)
}

function stopTimerInterval() {
    if (timerState.intervalId == null) return
    window.clearInterval(timerState.intervalId)
    timerState.intervalId = null
}

function syncTimerInterval() {
    if (timerState.enabled && canCountActiveTime()) {
        startTimerInterval()
    } else {
        stopTimerInterval()
    }
}

function startTimer() {
    if (!timerState.enabled) return
    if (!canCountActiveTime()) return
    reviewTimer.start()
    timerState.running = true
    syncTimerInterval()
}

function pauseTimer() {
    reviewTimer.pause()
    timerState.running = false
    syncTimerInterval()
    updateTimerUI()
}

function resetTimerState() {
    reviewTimer.reset()
    timerState.seconds = 0
    timerState.running = false
    timerState.enabled = false
    stopTimerInterval()
    updateTimerUI()
}

function updateTimerUI() {
    if (!overlay) return
    overlay.setTimerState(timerState.seconds, timerState.running)
}

/**
 * Initialize the content script
 */
async function init() {
    try {
        await checkCurrentPage()
    } catch {
        // Ignore if extension context is invalidated
    }

    // Watch for URL changes (SPA navigation)
    cleanupUrlWatcher = onUrlChange(async () => {
        try {
            await checkCurrentPage()
        } catch {
            // Ignore if extension context is invalidated
        }
    })

    // Watch for Auth changes
    cleanupAuth = onAuthChanged(async (auth) => {
        try {
            const context = getProblemContext(location.href)
            if (!context || !overlay) return

            if (!auth) {
                if (currentAbort) currentAbort.abort()
                overlay.showConnect(context)
                resetTimerState()
            } else {
                // Revalidate token if it's been a while since last check? 
                // For now, let's just trust storage updates, but maybe we should validate on load.
                // The requirement says "revalidate on every load".
                // We do that in checkCurrentPage -> which calls fetchAndRenderProblem -> which will fail 401 if invalid.
                // But let's add an explicit check here if it's a fresh load not just a storage change.
                fetchAndRenderProblem(context, auth)
            }
        } catch {
            // Ignore if extension context is invalidated
        }
    })

    document.addEventListener("visibilitychange", () => {
        if (!timerState.enabled) return
        if (document.visibilityState === "visible" && !isSubmittingReview) {
            startTimer()
        } else {
            pauseTimer()
        }
    })

    window.addEventListener("focus", () => {
        if (!timerState.enabled) return
        if (!isSubmittingReview) {
            startTimer()
        }
    })

    window.addEventListener("blur", () => {
        if (!timerState.enabled) return
        pauseTimer()
    })

    window.addEventListener("unhandledrejection", (event) => {
        const reason = event.reason
        const message = typeof reason === "string" ? reason : reason?.message
        if (message && message.toLowerCase().includes("extension context invalidated")) {
            event.preventDefault()
        }
    })
}

/**
 * Check the current page and update the overlay
 */
async function checkCurrentPage() {
    const context = getProblemContext(location.href)
    const previousContext = currentContext

    if (
        previousContext &&
        (!context ||
            previousContext.platform !== context.platform ||
            previousContext.slug !== context.slug)
    ) {
        resetTimerState()
    }

    // If we're not on a problem page, remove the overlay
    if (!context) {
        if (currentContext) {
            overlay?.destroy()
            overlay = null
            currentContext = null
        }
        resetTimerState()
        return
    }

    currentContext = context

    // Create overlay if not exists
    if (!overlay) {
        overlay = new SmaranaOverlay()
        overlay.setOpenCloseHandlers(
            () => {
                overlayOpen = true
                if (timerState.enabled && !isSubmittingReview) {
                    startTimer()
                }
            },
            () => {
                overlayOpen = false
                // Don't pause timer on close - keep running in bubble mode
                if (timerState.enabled && !isSubmittingReview) {
                    startTimer()
                }
            }
        )
    }

    // Check Auth
    const auth = await getAuth()

    // Revalidate on load
    if (auth) {
        try {
            // We use fetchProblem to implicitly validate, OR we can call fetchUser explicitely.
            // Since we are about to call fetchAndRenderProblem -> fetchProblem anyway, 
            // that WILL throw TOKEN_EXPIRED if 401. 
            // So we just need to catch that error and clear auth.
        } catch (e) {
            // ...
        }
    }

    if (!auth) {
        overlay.showConnect(context)
        resetTimerState()
        return
    }

    await fetchAndRenderProblem(context, auth)
}

async function fetchAndRenderProblem(context: ProblemContext, auth: any) {
    if (!overlay) return

    if (currentAbort) currentAbort.abort()
    currentAbort = new AbortController()

    overlay.setLoading(context)

    try {
        const data = await getProblem(context.platform, context.slug)

        if (!data.tracked) {
            overlay.setNotTracked(context)
            resetTimerState()
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

        const handleSave = async (notes: string, solution: string): Promise<boolean> => {
            try {
                const result = await saveProblem(context.platform, context.slug, notes, solution)
                return result.success
            } catch {
                return false
            }
        }

        const handleRefresh = () => fetchAndRenderProblem(context, auth)

        const handleMarkReviewed = async () => {
            if (isSubmittingReview) return
            isSubmittingReview = true
            overlay.setReviewState("submitting")
            pauseTimer()

            try {
                const timeSpentMs = reviewTimer.elapsedMs()
                const clientEventId = typeof crypto?.randomUUID === "function"
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

                await reviewProblem(context.platform, context.slug, 3, {
                    timeSpentMs,
                    clientEventId,
                })

                await fetchAndRenderProblem(context, auth)
                overlay.setReviewState("success")

                setTimeout(() => {
                    overlay?.hideBubbleTimer()
                    overlay?.collapse()
                }, 900)
            } catch {
                overlay.setReviewState("ready")
                if (overlayOpen) startTimer()
            } finally {
                isSubmittingReview = false
                resetTimerState()
            }
        }

        overlay.setProblem(context, problemData, handleRefresh, handleSave, handleMarkReviewed)

        timerState.enabled = true
        timerState.running = false
        updateTimerUI()
        timerState.running = false
        updateTimerUI()
        startTimer()
    } catch (err: any) {
        if (err.name === "AbortError") return

        if (err.message === "TOKEN_EXPIRED") {
            // Clear auth and show connect
            console.log("[Smarana] Token expired, clearing auth")
            // We can't clear auth from content script easily if it's in local storage? 
            // We can use chrome.storage.local.remove if we have permissions (we do).
            // But better to use the lib function if available. 
            // We can't import clearAuth from lib/auth-store directly if it's not exposed to content script properly?
            // It is imported in index.ts: import { getAuth, onAuthChanged } from "../lib/auth-store"
            // Wait, auth-store uses chrome.storage.local, so we can just use that.

            // Import clearAuth? 
            // Let's modify imports first.

            // For now just show connect.
            overlay.showConnect(context)
            resetTimerState()
            // And try to clear storage
            chrome.storage.local.remove("smarana.auth")
            return
        }

        console.error("[Smarana] Error fetching problem:", err)
        overlay.setError(context, "Failed to load problem data.", () => fetchAndRenderProblem(context, auth))
    }
}

// Initialize immediately
init()

// Clean up
window.addEventListener("unload", () => {
    if (cleanupUrlWatcher) cleanupUrlWatcher()
    if (cleanupAuth) cleanupAuth()
    resetTimerState()
    overlay?.destroy()
})

window.addEventListener("pagehide", () => {
    resetTimerState()
})
