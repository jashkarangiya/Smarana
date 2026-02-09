
import type { ProblemData } from "../lib/api"
import { getDifficultyColor, getPlatformName, type Platform, type ProblemContext } from "../lib/platform"
import { OVERLAY_CSS } from "./overlay-css"
import { clearAuth } from "../lib/auth-store"

const SMARANA_URL = "https://smarana.vercel.app"
const LOGO_URL = chrome.runtime.getURL("icons/icon48.png")

type UIMode = "bubble" | "panel"
type DataState = "loading" | "not-connected" | "not-tracked" | "problem" | "error"

type OverlayCallbacks = {
    onConnect?: () => void
    onRefresh?: () => void
    onSave?: (notes: string, solution: string) => Promise<boolean>
    onMarkReviewed?: () => void
    onOpen?: () => void
    onClose?: () => void
}

export class SmaranaOverlay {
    private host: HTMLElement
    private shadow: ShadowRoot
    private app: HTMLElement

    // Separate containers for bubble and panel
    private bubbleContainer: HTMLElement
    private panelContainer: HTMLElement

    // UI State Machine
    private mode: UIMode = "bubble"
    private dataState: DataState = "loading"
    private isEditing: boolean = false

    private currentContext: ProblemContext | null = null
    private currentData: any = null
    private callbacks: OverlayCallbacks = {}

    private timerSeconds = 0
    private timerRunning = false
    private showBubbleTimer = true
    private reviewState: "ready" | "submitting" | "success" = "ready"

    // Position (persisted)
    private pos = { x: 16, y: 16 }

    constructor() {
        this.host = document.createElement("div")
        this.host.id = "smarana-root"
        this.host.style.cssText = `
            position: fixed !important;
            z-index: 2147483647 !important;
            left: 16px !important;
            top: 16px !important;
            visibility: hidden !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            filter: drop-shadow(0 4px 24px rgba(0, 0, 0, 0.4));
            pointer-events: auto !important;
        `

        this.shadow = this.host.attachShadow({ mode: "closed" })

        const style = document.createElement("style")
        style.textContent = OVERLAY_CSS
        this.shadow.appendChild(style)

        this.app = document.createElement("div")
        this.app.className = "smarana-app"
        this.shadow.appendChild(this.app)

        // Create separate containers for bubble and panel
        this.bubbleContainer = document.createElement("div")
        this.bubbleContainer.className = "bubble-container"
        this.bubbleContainer.style.display = "block"

        this.panelContainer = document.createElement("div")
        this.panelContainer.className = "panel-container"
        this.panelContainer.style.display = "none"

        this.app.appendChild(this.bubbleContainer)
        this.app.appendChild(this.panelContainer)


        document.documentElement.appendChild(this.host)

        // Setup global event delegation using composedPath() for shadow DOM
        this.setupEventDelegation()

        this.loadPosition()
    }

    // ==================== EVENT DELEGATION (Shadow DOM compatible) ====================

    private findActionFromEvent(e: Event): string | null {
        // composedPath() returns the full path including shadow DOM internals
        for (const node of e.composedPath()) {
            if (node instanceof HTMLElement && node.dataset?.smAction) {
                return node.dataset.smAction
            }
        }
        return null
    }

    private setupEventDelegation() {
        // Attach to shadow root so it captures all clicks inside
        this.shadow.addEventListener("click", (e) => {
            const action = this.findActionFromEvent(e)

            if (!action) return

            switch (action) {
                case "open":
                    e.stopPropagation()
                    this.setMode("panel")
                    break
                case "close":
                    e.stopPropagation()
                    e.preventDefault()
                    this.setMode("bubble")
                    break
                case "connect":
                    if (this.callbacks.onConnect) this.callbacks.onConnect()
                    break
                case "refresh":
                    if (this.callbacks.onRefresh) this.callbacks.onRefresh()
                    break
                case "retry":
                    if (this.currentData?.onRetry) this.currentData.onRetry()
                    break
                case "edit":
                    this.isEditing = true
                    this.renderPanelContent()
                    break
                case "cancel-edit":
                    this.isEditing = false
                    this.renderPanelContent()
                    break
                case "save":
                    this.handleSave()
                    break
                case "reveal-spoiler":
                    this.toggleSpoiler(e)
                    break
                case "disconnect":
                    clearAuth()
                    break
                case "mark-reviewed":
                    if (this.callbacks.onMarkReviewed) this.callbacks.onMarkReviewed()
                    break
            }
        })
    }

    private setMode(newMode: UIMode) {
        this.mode = newMode
        this.isEditing = false

        // CRITICAL: Use display:none to completely remove from layout
        if (newMode === "bubble") {
            this.panelContainer.style.display = "none"
            this.panelContainer.style.pointerEvents = "none"
            this.bubbleContainer.style.display = "block"
            this.bubbleContainer.style.pointerEvents = "auto"
            this.renderBubbleContent()
            if (this.callbacks.onClose) this.callbacks.onClose()
        } else {
            this.bubbleContainer.style.display = "none"
            this.bubbleContainer.style.pointerEvents = "none"
            this.panelContainer.style.display = "block"
            this.panelContainer.style.pointerEvents = "auto"
            this.renderPanelContent()
            if (this.callbacks.onOpen) this.callbacks.onOpen()
        }
    }

    collapse() {
        this.setMode("bubble")
    }

    hideBubbleTimer() {
        this.showBubbleTimer = false
        this.renderBubbleContent()
    }

    setOpenCloseHandlers(onOpen?: () => void, onClose?: () => void) {
        this.callbacks.onOpen = onOpen
        this.callbacks.onClose = onClose
    }

    private async handleSave() {
        if (!this.callbacks.onSave) return

        const notesInput = this.panelContainer.querySelector(".smr-edit-notes") as HTMLTextAreaElement
        const solutionInput = this.panelContainer.querySelector(".smr-edit-solution") as HTMLTextAreaElement
        const saveBtn = this.panelContainer.querySelector("[data-sm-action='save']") as HTMLButtonElement

        if (!saveBtn) return

        const notes = notesInput?.value || ""
        const solution = solutionInput?.value || ""

        saveBtn.textContent = "Saving..."
        saveBtn.disabled = true

        const success = await this.callbacks.onSave(notes, solution)

        if (success) {
            if (this.currentData?.problem) {
                this.currentData.problem.notes = notes
                this.currentData.problem.solution = solution
            }
            this.isEditing = false
            this.renderPanelContent()
        } else {
            saveBtn.textContent = "Save"
            saveBtn.disabled = false
            saveBtn.classList.add("smr-error")
            setTimeout(() => saveBtn.classList.remove("smr-error"), 2000)
        }
    }

    private toggleSpoiler(e: Event) {
        // Find the container
        let container: HTMLElement | null = null
        for (const node of e.composedPath()) {
            if (node instanceof HTMLElement && node.classList.contains("smr-spoiler-container")) {
                container = node
                break
            }
        }

        if (container) {
            container.classList.add("revealed")
        }
    }

    // ==================== POSITION ====================

    private async loadPosition() {
        try {
            const result = await chrome.storage.local.get(["smarana_overlay_pos"])
            if (result.smarana_overlay_pos) {
                this.pos = result.smarana_overlay_pos
            }
        } catch {
            // Ignore — use default position
        }

        this.clampPosition()
        this.applyPosition()
        this.host.style.visibility = "visible"

        // Initial render
        this.setMode("bubble")
    }

    private clampPosition() {
        const maxX = window.innerWidth - 60
        const maxY = window.innerHeight - 60
        this.pos.x = Math.max(8, Math.min(this.pos.x, maxX))
        this.pos.y = Math.max(8, Math.min(this.pos.y, maxY))
    }

    private applyPosition() {
        this.host.style.left = `${this.pos.x}px`
        this.host.style.top = `${this.pos.y}px`
    }

    private async savePosition() {
        try {
            await chrome.storage.local.set({ smarana_overlay_pos: this.pos })
        } catch {
            // Ignore — position will reset next load
        }
    }

    // ==================== DRAGGABLE ====================

    private attachDrag(element: HTMLElement) {
        // Guard: avoid duplicate bindings
        if (element.dataset.smDragBound === "1") return
        element.dataset.smDragBound = "1"

        element.style.touchAction = "none"
        element.style.cursor = "grab"

        let startX = 0, startY = 0, baseX = 0, baseY = 0, dragging = false

        const onPointerDown = (e: PointerEvent) => {
            if (e.button !== 0) return // Left click only

            const target = e.target as HTMLElement

            // Explicit no-drag elements
            if (target.closest("[data-sm-no-drag]")) return

            // Interactive elements - prevent drag start AND preventDefault hijacking
            const interactive = target.closest("button, a, input, textarea, select, [data-sm-action]")

            // If clicking an interactive element that IS NOT the drag handle itself, let the event pass naturally
            if (interactive && interactive !== element) {
                return
            }

            // If the element ITSELF is interactive (like the bubble button), we still want to allow 'click' if no drag occurs.
            // We only preventDefault if we are sure we are handling it as a drag (or potentially a drag).
            // But we must preventDefault to stop text selection etc.
            // The trick is: If we preventDefault on pointerdown, the focus might not move? 
            // Actually, for custom drag, preventDefault is standard.

            dragging = false
            element.setPointerCapture(e.pointerId)
            element.style.cursor = "grabbing"

            baseX = this.pos.x
            baseY = this.pos.y
            startX = e.clientX
            startY = e.clientY

            e.preventDefault()
        }

        // ... (rest is mostly fine, but I will replace the whole block to be safe)

        const onPointerMove = (e: PointerEvent) => {
            if (!element.hasPointerCapture(e.pointerId)) return

            const dx = e.clientX - startX
            const dy = e.clientY - startY

            if (!dragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
                dragging = true
            }

            if (!dragging) return

            const x = baseX + dx
            const y = baseY + dy

            const maxX = window.innerWidth - this.host.offsetWidth - 8
            const maxY = window.innerHeight - this.host.offsetHeight - 8

            this.pos.x = Math.max(8, Math.min(x, maxX))
            this.pos.y = Math.max(8, Math.min(y, maxY))
            this.applyPosition()
        }

        const onPointerUp = (e: PointerEvent) => {
            if (!element.hasPointerCapture(e.pointerId)) return

            element.releasePointerCapture(e.pointerId)
            element.style.cursor = "grab"

            if (dragging) {
                this.savePosition()

                // Prevent click after drag
                const stopClick = (ev: Event) => {
                    ev.stopPropagation()
                    ev.preventDefault()
                    element.removeEventListener("click", stopClick, { capture: true })
                }
                element.addEventListener("click", stopClick, { capture: true })
            }

            dragging = false
        }

        const onPointerCancel = (e: PointerEvent) => {
            element.releasePointerCapture(e.pointerId)
            element.style.cursor = "grab"
            dragging = false
        }

        element.addEventListener("pointerdown", onPointerDown)
        element.addEventListener("pointermove", onPointerMove)
        element.addEventListener("pointerup", onPointerUp)
        element.addEventListener("pointercancel", onPointerCancel)
    }

    // ==================== PUBLIC API ====================

    setLoading(context: ProblemContext) {
        this.currentContext = context
        this.currentData = null
        this.dataState = "loading"
        this.isEditing = false
        this.render()
    }

    showConnect(context: ProblemContext) {
        this.currentContext = context
        this.currentData = null
        this.callbacks.onConnect = () => {
            chrome.runtime.sendMessage({ type: "CONNECT" })
        }
        this.dataState = "not-connected"
        this.isEditing = false
        this.render()
    }

    setNotConnected(context: ProblemContext, onConnect: () => void) {
        this.showConnect(context)
        this.callbacks.onConnect = onConnect
    }

    setNotTracked(context: ProblemContext) {
        this.currentContext = context
        this.currentData = null
        this.dataState = "not-tracked"
        this.isEditing = false
        this.render()
    }

    setProblem(
        context: ProblemContext,
        problem: ProblemData,
        onRefresh: () => void,
        onSave?: (notes: string, solution: string) => Promise<boolean>,
        onMarkReviewed?: () => void
    ) {
        this.currentContext = context
        this.currentData = { problem, onRefresh }
        this.callbacks.onRefresh = onRefresh
        this.callbacks.onSave = onSave
        this.callbacks.onMarkReviewed = onMarkReviewed
        this.showBubbleTimer = true
        this.reviewState = "ready"
        this.dataState = "problem"
        this.isEditing = false
        this.render()
    }

    setReviewState(state: "ready" | "submitting" | "success") {
        this.reviewState = state
        if (this.mode === "panel") {
            this.renderPanelContent()
        }
    }

    setTimerState(seconds: number, running: boolean) {
        this.timerSeconds = seconds
        this.timerRunning = running
        this.updateTimerUI()
    }


    setError(context: ProblemContext, message: string, onRetry: () => void) {
        this.currentContext = context
        this.currentData = { message, onRetry }
        this.dataState = "error"
        this.isEditing = false
        this.render()
    }

    destroy() {
        this.host.remove()
    }

    // ==================== RENDERING ====================

    private render() {
        this.renderBubbleContent()
        if (this.mode === "panel") {
            this.renderPanelContent()
        }
    }

    private renderBubbleContent() {
        const statusIndicator = this.getStatusIndicator()
        const timerLabel = this.formatTimer(this.timerSeconds)
        const showTimer = this.dataState === "problem" && this.showBubbleTimer

        this.bubbleContainer.innerHTML = `
            <div class="bubble" data-sm-action="open" role="button" aria-label="Open Smarana" tabindex="0">
                <img src="${LOGO_URL}" width="28" height="28" class="bubble-logo" alt="Smarana" draggable="false">
                ${showTimer ? `<span class="bubble-timer">${timerLabel}</span>` : ""}
                ${statusIndicator}
            </div>
        `

        const bubble = this.bubbleContainer.querySelector(".bubble") as HTMLElement
        if (bubble) {
            this.attachDrag(bubble)
        }
    }

    private renderPanelContent() {
        const platformName = this.currentContext ? getPlatformName(this.currentContext.platform) : ""

        let content = ""
        if (this.dataState === "loading") content = this.getLoadingContent()
        else if (this.dataState === "not-connected") content = this.getNotConnectedContent()
        else if (this.dataState === "not-tracked") content = this.getNotTrackedContent()
        else if (this.dataState === "problem") {
            content = this.isEditing
                ? this.getEditContent(this.currentData.problem)
                : this.getProblemContent(this.currentData.problem)
        }
        else if (this.dataState === "error") content = this.getErrorContent(this.currentData.message)

        this.panelContainer.innerHTML = `
            <div class="panel">
                <div class="smr-header">
                    <div class="smr-brand">
                        <img src="${LOGO_URL}" class="smr-logo" alt="Smarana" draggable="false">
                        <span class="smr-title">Smarana</span>
                        ${platformName ? `<span class="smr-pill">${platformName}</span>` : ""}
                    </div>
                    <button class="smr-close-btn" data-sm-action="close" type="button" aria-label="Close panel">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events:none;">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="smr-body">
                    ${content}
                </div>
            </div>
        `

        // Attach drag to header
        const header = this.panelContainer.querySelector(".smr-header") as HTMLElement
        if (header) {
            this.attachDrag(header)
        }
    }

    // ==================== CONTENT GENERATORS ====================

    private getLoadingContent(): string {
        return `
            <div class="smr-loading">
                <div class="smr-spinner"></div>
                <span>Loading...</span>
            </div>
        `
    }

    private getNotConnectedContent(): string {
        return `
            <div class="smr-empty">
                <div class="smr-empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                </div>
                <p class="smr-empty-title">Connect to Smarana</p>
                <p class="smr-subtext">Connect to view your notes, saved solution (if enabled), and review status for this problem.</p>
                <button id="smConnectBtn" class="smr-primary-btn smr-connect-btn" data-sm-action="connect" type="button">Connect Account</button>
            </div>
        `
    }

    private getNotTrackedContent(): string {
        return `
            <div class="smr-empty">
                <div class="smr-empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v4"></path>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <p class="smr-empty-title">Not in your list</p>
                <p class="smr-empty-desc">This problem isn't being tracked yet. Add it from Smarana.</p>
                <a href="${SMARANA_URL}/dashboard" target="_blank" class="smr-primary-btn">Open Smarana</a>
            </div>
        `
    }

    private getProblemContent(problem: ProblemData): string {
        const diffClass = this.getDifficultyClass(problem.difficulty)
        const reviewStatus = this.getReviewStatus(problem)
        const timerHtml = this.getTimerPillHtml()
        const reviewBanner = this.getReviewBannerHtml()

        const notesHtml = problem.notes && problem.notes.trim()
            ? `<div class="smr-prewrap">${this.escapeHtml(problem.notes)}</div>`
            : `<span class="smr-muted-2">No notes saved.</span>`

        let solutionBodyHtml = ""
        let solutionToggle = ""

        if (problem.solution === null) {
            solutionBodyHtml = `<div class="smr-card-body"><span class="smr-muted-2">Hidden by your settings.</span></div>`
        } else if (!problem.solution || !problem.solution.trim()) {
            solutionBodyHtml = `<div class="smr-card-body"><span class="smr-muted-2">No solution saved.</span></div>`
        } else {
            solutionToggle = `<button class="smr-reveal-btn" data-sm-action="reveal" type="button">Reveal</button>`
            solutionBodyHtml = `
                <div class="smr-card-body smr-solution-hidden"><span class="smr-muted-2">Click "Reveal" to show.</span></div>
                <div class="smr-card-body smr-code smr-solution-content" style="display:none;"><pre>${this.escapeHtml(problem.solution)}</pre></div>
            `
        }

        const editButton = this.callbacks.onSave
            ? `<button class="smr-icon-btn" data-sm-action="edit" type="button" title="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events:none;">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>`
            : ""

        return `
            <div class="smr-meta">
                <span class="smr-difficulty ${diffClass}">${problem.difficulty}</span>
                <span class="smr-muted">Repetition <b>${problem.reviewCount}</b></span>
            </div>

            <div class="smr-banner ${reviewStatus.bannerClass}">
                <span class="smr-banner-dot"></span>
                <span>${reviewStatus.text}</span>
            </div>
            ${reviewBanner}

            <section class="smr-card">
                <div class="smr-card-head">
                    <span class="smr-card-label">Notes</span>
                </div>
                <div class="smr-card-body smr-prewrap">${notesHtml}</div>
            </section>

            <section class="smr-card">
                <div class="smr-card-head">
                    <span class="smr-card-label">Solution</span>
                </div>
                ${this.getSolutionContent(problem)}
            </section>

            ${timerHtml}

            <div class="smr-footer">
                <a href="${problem.smaranaUrl}" target="_blank" class="smr-primary-btn">Open in Smarana</a>
                <button class="smr-icon-btn ${this.reviewState === "submitting" ? "smr-icon-btn--disabled" : ""}" data-sm-action="mark-reviewed" type="button" title="Mark Reviewed">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events:none;">
                        <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                </button>
                ${editButton}
                <button class="smr-icon-btn" data-sm-action="refresh" type="button" title="Refresh">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events:none;">
                        <path d="M23 4v6h-6"></path>
                        <path d="M1 20v-6h6"></path>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>
                <button class="smr-icon-btn" data-sm-action="disconnect" type="button" title="Disconnect">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events:none;">
                         <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                         <polyline points="16 17 21 12 16 7"></polyline>
                         <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        `
    }

    private getSolutionContent(problem: ProblemData): string {
        if (!problem.solution || !problem.solution.trim()) {
            return `<div class="smr-card-body"><span class="smr-muted-2">No solution saved.</span></div>`
        }

        // Check if previously revealed? For now, always collapsed on refresh/re-open 
        // effectively "Spaced Repetition" - you should try to recall first!
        return `
            <div class="smr-spoiler-container" data-sm-action="reveal-spoiler">
                <div class="smr-card-body smr-code smr-spoiler-content smr-spoiler-blur">
                    <pre>${this.escapeHtml(problem.solution)}</pre>
                </div>
                <div class="smr-spoiler-overlay">
                    <div class="smr-spoiler-btn">Click to Reveal</div>
                </div>
            </div>
        `
    }

    private getTimerPillHtml(): string {
        const timeLabel = this.formatTimer(this.timerSeconds)
        return `
            <div class="smr-timer">
                <span class="smr-timer-icon">⏱</span>
                <span class="smr-timer-time">${timeLabel}</span>
            </div>
        `
    }

    private getReviewBannerHtml(): string {
        if (this.reviewState === "submitting") {
            return `<div class="smr-banner smr-banner-neutral"><span>Saving review…</span></div>`
        }
        if (this.reviewState === "success") {
            return `<div class="smr-banner smr-banner-upcoming"><span>Saved ✅</span></div>`
        }
        return ""
    }


    private getEditContent(problem: ProblemData): string {
        const notesValue = problem.notes || ""
        const solutionValue = problem.solution || ""

        return `
            <div class="smr-edit">
                <div class="smr-edit-section">
                    <label class="smr-edit-label">Notes</label>
                    <textarea class="smr-edit-textarea smr-edit-notes" placeholder="Add your notes here...">${this.escapeHtml(notesValue)}</textarea>
                </div>

                <div class="smr-edit-section">
                    <label class="smr-edit-label">Solution</label>
                    <textarea class="smr-edit-textarea smr-code-input smr-edit-solution" placeholder="Paste your solution code...">${this.escapeHtml(solutionValue)}</textarea>
                </div>

                <div class="smr-footer">
                    <button class="smr-primary-btn" data-sm-action="save" type="button">Save</button>
                    <button class="smr-secondary-btn" data-sm-action="cancel-edit" type="button">Cancel</button>
                </div>
            </div>
        `
    }

    private getErrorContent(message: string): string {
        return `
            <div class="smr-empty">
                <div class="smr-empty-icon smr-error-text">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                </div>
                <p class="smr-empty-title smr-error-text">Something went wrong</p>
                <p class="smr-empty-desc">${this.escapeHtml(message)}</p>
                <button class="smr-secondary-btn" data-sm-action="retry" type="button">Try Again</button>
            </div>
        `
    }

    // ==================== HELPERS ====================

    private getStatusIndicator(): string {
        if (this.dataState === "loading") return `<span class="bubble-status bubble-status-loading"></span>`
        if (this.dataState === "not-connected") return `<span class="bubble-status bubble-status-warning"></span>`

        if (this.dataState === "problem" && this.currentData?.problem) {
            const p = this.currentData.problem as ProblemData
            if (p.nextReviewAt) {
                const nextReview = new Date(p.nextReviewAt)
                if (nextReview <= new Date()) return `<span class="bubble-status bubble-status-due"></span>`
            }
            return `<span class="bubble-status bubble-status-ok"></span>`
        }
        return ""
    }

    private getReviewStatus(problem: ProblemData): { text: string; bannerClass: string } {
        if (!problem.nextReviewAt) {
            return { text: "Not scheduled", bannerClass: "smr-banner-neutral" }
        }

        const nextReview = new Date(problem.nextReviewAt)
        const now = new Date()
        const diffTime = nextReview.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays <= 0) {
            return { text: "Review available now", bannerClass: "smr-banner-due" }
        }

        return {
            text: `Due in ${diffDays} day${diffDays !== 1 ? "s" : ""}`,
            bannerClass: "smr-banner-upcoming"
        }
    }

    private getDifficultyClass(difficulty: string): string {
        const d = difficulty.toLowerCase()
        if (d === "easy") return "smr-easy"
        if (d === "medium") return "smr-medium"
        if (d === "hard") return "smr-hard"
        return ""
    }

    private formatTimer(seconds: number): string {
        const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
        const ss = String(seconds % 60).padStart(2, "0")
        return `${mm}:${ss}`
    }

    private updateTimerUI() {
        if (this.mode === "panel" && this.dataState === "problem") {
            const timeEl = this.panelContainer.querySelector(".smr-timer-time") as HTMLElement | null
            if (timeEl) timeEl.textContent = this.formatTimer(this.timerSeconds)
        }
        const bubbleTime = this.bubbleContainer.querySelector(".bubble-timer") as HTMLElement | null
        if (bubbleTime) bubbleTime.textContent = this.formatTimer(this.timerSeconds)
    }

    private escapeHtml(text: string): string {
        const div = document.createElement("div")
        div.textContent = text
        return div.innerHTML
    }
}
