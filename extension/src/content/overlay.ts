import type { ProblemData } from "../lib/api"
import { getDifficultyColor, getPlatformName, type Platform, type ProblemContext } from "../lib/platform"
import { OVERLAY_CSS } from "./overlay-css"

const EMBER_ORANGE = "#BB7331"
const SMARANA_URL = "https://smarana.vercel.app"
const LOGO_URL = chrome.runtime.getURL("icons/icon48.png")

type OverlayCallbacks = {
    onConnect?: () => void
    onRefresh?: () => void
    onSave?: (notes: string, solution: string) => Promise<boolean>
}

export class SmaranaOverlay {
    private host: HTMLElement
    private shadow: ShadowRoot
    private app: HTMLElement
    private isExpanded: boolean = false
    private isEditing: boolean = false
    private currentContext: ProblemContext | null = null
    private currentData: any = null
    private callbacks: OverlayCallbacks = {}

    // Default position (top-left by default, but updated by dragging)
    private pos = { x: 16, y: 16 }

    constructor() {
        this.host = document.createElement("div")
        this.host.id = "smarana-root"
        // Initial style hidden to prevent flash before position load
        this.host.style.cssText = `
            position: fixed !important;
            z-index: 2147483647 !important;
            left: 16px !important;
            top: 16px !important;
            visibility: hidden !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            filter: drop-shadow(0 4px 24px rgba(0, 0, 0, 0.4));
        `

        this.shadow = this.host.attachShadow({ mode: "closed" })

        const style = document.createElement("style")
        style.textContent = OVERLAY_CSS
        this.shadow.appendChild(style)

        this.app = document.createElement("div")
        this.app.className = "smarana-app"
        this.shadow.appendChild(this.app)

        document.documentElement.appendChild(this.host)

        this.loadPosition()
    }

    private async loadPosition() {
        try {
            const result = await chrome.storage.local.get(["smarana_overlay_pos"])
            if (result.smarana_overlay_pos) {
                this.pos = result.smarana_overlay_pos
            }
        } catch (e) {
            console.error("[Smarana] Failed to load position", e)
        }

        this.updatePosition()
        this.host.style.visibility = "visible"
    }

    private updatePosition() {
        this.host.style.left = `${this.pos.x}px`
        this.host.style.top = `${this.pos.y}px`
    }

    // --- Public API ---

    setLoading(context: ProblemContext) {
        this.currentContext = context
        this.currentData = null
        this.isEditing = false
        this.renderState("loading")
    }

    setNotConnected(context: ProblemContext, onConnect: () => void) {
        this.currentContext = context
        this.currentData = { onConnect }
        this.callbacks.onConnect = onConnect
        this.isEditing = false
        this.renderState("not-connected")
    }

    setNotTracked(context: ProblemContext) {
        this.currentContext = context
        this.currentData = null
        this.isEditing = false
        this.renderState("not-tracked")
    }

    setProblem(
        context: ProblemContext,
        problem: ProblemData,
        onRefresh: () => void,
        onSave?: (notes: string, solution: string) => Promise<boolean>
    ) {
        this.currentContext = context
        this.currentData = { problem, onRefresh }
        this.callbacks.onRefresh = onRefresh
        this.callbacks.onSave = onSave
        this.isEditing = false
        this.renderState("problem")
    }

    setError(context: ProblemContext, message: string, onRetry: () => void) {
        this.currentContext = context
        this.currentData = { message, onRetry }
        this.isEditing = false
        this.renderState("error")
    }

    destroy() {
        this.host.remove()
    }

    // --- Rendering ---

    private renderState(state: string) {
        if (this.isExpanded) {
            this.renderPanel(state, this.currentData)
        } else {
            this.renderBubble(state, this.currentData)
        }
    }

    private renderBubble(state: string, data?: any) {
        const statusIndicator = this.getStatusIndicator(state, data)

        this.app.innerHTML = `
            <div class="bubble" role="button" aria-label="Open Smarana">
                <img src="${LOGO_URL}" width="24" height="24" class="bubble-logo" alt="Smarana">
                ${statusIndicator}
            </div>
        `

        const bubble = this.app.querySelector(".bubble") as HTMLElement
        if (bubble) {
            this.setupDraggable(bubble)

            // Handle click vs drag
            // setupDraggable prevents click event propogation if dragged
            bubble.addEventListener("click", () => {
                this.isExpanded = true
                this.renderPanel(state, data)
            })
        }
    }

    private renderPanel(state: string, data?: any) {
        const platformName = this.currentContext ? getPlatformName(this.currentContext.platform) : ""

        // Generate content based on state
        let content = ""
        if (state === "loading") content = this.getLoadingContent()
        else if (state === "not-connected") content = this.getNotConnectedContent()
        else if (state === "not-tracked") content = this.getNotTrackedContent()
        else if (state === "problem") {
            content = this.isEditing
                ? this.getEditContent(data.problem)
                : this.getProblemContent(data.problem)
        }
        else if (state === "error") content = this.getErrorContent(data.message)

        this.app.innerHTML = `
            <div class="panel">
                <div class="panel-header" title="Drag to move">
                    <div class="panel-title">
                        <img src="${LOGO_URL}" width="20" height="20" alt="Smarana">
                        <span>Smarana</span>
                        ${platformName ? `<span class="platform-badge">${platformName}</span>` : ""}
                    </div>
                    <button class="close-btn" aria-label="Close panel">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="panel-body">
                    ${content}
                </div>
            </div>
        `

        // Draggable Header
        const header = this.app.querySelector(".panel-header") as HTMLElement
        if (header) {
            this.setupDraggable(header)
        }

        // Close logic
        const closeBtn = this.app.querySelector(".close-btn")
        closeBtn?.addEventListener("click", () => {
            this.isExpanded = false
            this.isEditing = false
            this.renderBubble(state, data)
        })

        // Interactive Handlers
        if (state === "not-connected" && data?.onConnect) {
            this.app.querySelector(".connect-btn")?.addEventListener("click", data.onConnect)
        }

        if (state === "problem" && data?.problem) {
            if (this.isEditing) {
                this.setupEditHandlers(data.problem)
            } else {
                this.setupProblemHandlers(data)
            }
        }

        if (state === "error" && data?.onRetry) {
            this.app.querySelector(".retry-btn")?.addEventListener("click", data.onRetry)
        }
    }

    private setupProblemHandlers(data: any) {
        // Solution toggle
        const toggleBtn = this.app.querySelector(".solution-toggle")
        const solutionContent = this.app.querySelector(".solution-content") as HTMLElement
        if (toggleBtn && solutionContent) {
            toggleBtn.addEventListener("click", () => {
                const isHidden = solutionContent.style.display === "none"
                solutionContent.style.display = isHidden ? "block" : "none"
                toggleBtn.textContent = isHidden ? "Hide" : "Reveal"
            })
        }

        // Edit button
        const editBtn = this.app.querySelector(".edit-btn")
        if (editBtn && this.callbacks.onSave) {
            editBtn.addEventListener("click", () => {
                this.isEditing = true
                this.renderPanel("problem", data)
            })
        }

        // Refresh
        if (data.onRefresh) {
            this.app.querySelector(".refresh-btn")?.addEventListener("click", data.onRefresh)
        }
    }

    private setupEditHandlers(problem: ProblemData) {
        const notesInput = this.app.querySelector(".edit-notes") as HTMLTextAreaElement
        const solutionInput = this.app.querySelector(".edit-solution") as HTMLTextAreaElement
        const saveBtn = this.app.querySelector(".save-btn")
        const cancelBtn = this.app.querySelector(".cancel-edit-btn")

        cancelBtn?.addEventListener("click", () => {
            this.isEditing = false
            this.renderPanel("problem", this.currentData)
        })

        saveBtn?.addEventListener("click", async () => {
            if (!this.callbacks.onSave) return

            const notes = notesInput?.value || ""
            const solution = solutionInput?.value || ""

            // Show saving state
            saveBtn.textContent = "Saving..."
            ;(saveBtn as HTMLButtonElement).disabled = true

            const success = await this.callbacks.onSave(notes, solution)

            if (success) {
                // Update the problem data
                if (this.currentData?.problem) {
                    this.currentData.problem.notes = notes
                    this.currentData.problem.solution = solution
                }
                this.isEditing = false
                this.renderPanel("problem", this.currentData)
            } else {
                saveBtn.textContent = "Save"
                ;(saveBtn as HTMLButtonElement).disabled = false
                // Show error state briefly
                saveBtn.classList.add("error")
                setTimeout(() => saveBtn.classList.remove("error"), 2000)
            }
        })
    }

    // --- Draggable Logic ---

    private setupDraggable(element: HTMLElement) {
        let startX = 0
        let startY = 0
        let startPos = { x: 0, y: 0 }
        let isDragging = false

        const onDown = (e: PointerEvent) => {
            if (e.button !== 0) return // Only Left Click

            isDragging = false
            startX = e.clientX
            startY = e.clientY
            startPos = { ...this.pos }

            element.setPointerCapture(e.pointerId)

            element.addEventListener("pointermove", onMove)
            element.addEventListener("pointerup", onUp)
            element.addEventListener("pointercancel", onUp)
        }

        const onMove = (e: PointerEvent) => {
            const dx = e.clientX - startX
            const dy = e.clientY - startY

            // Drag threshold
            if (!isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
                isDragging = true
                // Prevent selection/etc
                element.style.cursor = "grabbing"
            }

            if (!isDragging) return

            // Update position
            let nx = startPos.x + dx
            let ny = startPos.y + dy

            // Clamp to viewport
            const winW = window.innerWidth
            const winH = window.innerHeight

            // Estimate element size if needed, or just clamp reasonably
            // We want at least some part visible
            nx = Math.max(-20, Math.min(winW - 40, nx))
            ny = Math.max(-20, Math.min(winH - 40, ny))

            this.pos = { x: nx, y: ny }
            this.updatePosition()
        }

        const onUp = (e: PointerEvent) => {
            element.releasePointerCapture(e.pointerId)
            element.style.cursor = ""

            element.removeEventListener("pointermove", onMove)
            element.removeEventListener("pointerup", onUp)
            element.removeEventListener("pointercancel", onUp)

            if (isDragging) {
                chrome.storage.local.set({ smarana_overlay_pos: this.pos })

                // Prevent the click event that follows
                const stopClick = (ev: Event) => {
                    ev.stopPropagation()
                    ev.preventDefault()
                    element.removeEventListener("click", stopClick, { capture: true })
                }
                element.addEventListener("click", stopClick, { capture: true })
            }
        }

        element.addEventListener("pointerdown", onDown)
    }

    // --- Content Generators ---

    private getLoadingContent(): string {
        return `
            <div class="loading-state">
                <div class="spinner"></div>
                <span>Loading...</span>
            </div>
        `
    }

    private getNotConnectedContent(): string {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                </div>
                <p class="empty-title">Connect to Smarana</p>
                <p class="empty-desc">See your notes and track review progress</p>
                <button class="btn btn-primary connect-btn">Connect Account</button>
            </div>
        `
    }

    private getNotTrackedContent(): string {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v4"></path>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <p class="empty-title">Not in your list</p>
                <p class="empty-desc">This problem isn't being tracked yet</p>
                <a href="${SMARANA_URL}/dashboard" target="_blank" class="btn btn-primary">Open Smarana</a>
            </div>
        `
    }

    private getProblemContent(problem: ProblemData): string {
        const diffColor = getDifficultyColor(problem.difficulty)
        const reviewStatus = this.getReviewStatus(problem)

        const notesHtml = problem.notes && problem.notes.trim()
            ? this.escapeHtml(problem.notes)
            : `<span class="block-content-hidden">No notes saved.</span>`

        let solutionHtml = ""
        if (problem.solution === null) {
            solutionHtml = `<div class="block-content-hidden">Solution hidden by your settings.</div>`
        } else if (!problem.solution || !problem.solution.trim()) {
            solutionHtml = `<div class="block-content-hidden">No solution saved.</div>`
        } else {
            solutionHtml = `<pre>${this.escapeHtml(problem.solution)}</pre>`
        }

        const solutionHeaderExtra = problem.solution !== null && problem.solution?.trim()
            ? `<button class="solution-toggle">Reveal</button>`
            : ""

        const solutionDisplay = "none"

        // Show edit button only if onSave callback is provided
        const editButton = this.callbacks.onSave
            ? `<button class="btn btn-ghost edit-btn" title="Edit notes & solution">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>`
            : ""

        return `
            <div class="problem-content">
                <div class="problem-info-header">
                    <span class="difficulty" style="color: ${diffColor}">${problem.difficulty}</span>
                    <span class="review-count">Repetition ${problem.reviewCount}</span>
                </div>

                <div class="status-badge ${reviewStatus.class}">
                    ${reviewStatus.icon}
                    <span>${reviewStatus.text}</span>
                </div>

                <div class="block">
                    <div class="block-header"><span>Notes</span></div>
                    <div class="block-content">${notesHtml}</div>
                </div>

                <div class="block">
                    <div class="block-header">
                        <span>Solution</span>
                        ${solutionHeaderExtra}
                    </div>
                    <div class="block-content solution-content" style="display: ${solutionDisplay}">
                        ${solutionHtml}
                    </div>
                </div>

                <div class="panel-footer">
                    <a href="${problem.smaranaUrl}" target="_blank" class="btn btn-primary open-btn">Open in Smarana</a>
                    ${editButton}
                    <button class="btn btn-ghost refresh-btn" title="Refresh">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6"></path>
                            <path d="M1 20v-6h6"></path>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `
    }

    private getEditContent(problem: ProblemData): string {
        const notesValue = problem.notes || ""
        const solutionValue = problem.solution || ""

        return `
            <div class="edit-content">
                <div class="edit-section">
                    <label class="edit-label">Notes</label>
                    <textarea class="edit-notes" placeholder="Add your notes here...">${this.escapeHtml(notesValue)}</textarea>
                </div>

                <div class="edit-section">
                    <label class="edit-label">Solution</label>
                    <textarea class="edit-solution" placeholder="Paste your solution code here...">${this.escapeHtml(solutionValue)}</textarea>
                </div>

                <div class="panel-footer">
                    <button class="btn btn-primary save-btn">Save</button>
                    <button class="btn btn-ghost cancel-edit-btn">Cancel</button>
                </div>
            </div>
        `
    }

    private getErrorContent(message: string): string {
        return `
            <div class="empty-state">
                 <div class="empty-icon error-text">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                </div>
                <p class="empty-title error-text">Something went wrong</p>
                <p class="empty-desc">${this.escapeHtml(message)}</p>
                <button class="btn btn-secondary retry-btn">Try Again</button>
            </div>
        `
    }

    private getStatusIndicator(state: string, data?: any): string {
        if (state === "loading") return `<span class="bubble-status bubble-status-loading"></span>`
        if (state === "not-connected") return `<span class="bubble-status bubble-status-warning"></span>`

        if (state === "problem" && data?.problem) {
            const p = data.problem as ProblemData
            // Check overdue
            if (p.nextReviewAt) {
                const nextReview = new Date(p.nextReviewAt)
                const now = new Date()
                if (nextReview <= now) return `<span class="bubble-status bubble-status-due"></span>`
            }
            return `<span class="bubble-status bubble-status-ok"></span>`
        }
        return ""
    }

    private getReviewStatus(problem: ProblemData): { text: string; class: string; icon: string } {
        if (!problem.nextReviewAt) {
            return {
                text: "Not scheduled",
                class: "status-neutral",
                icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>`
            }
        }

        const nextReview = new Date(problem.nextReviewAt)
        const now = new Date()
        const diffTime = nextReview.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays <= 0) {
            return {
                text: "Review available now",
                class: "status-due",
                icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
            }
        }

        return {
            text: `Due in ${diffDays} day${diffDays !== 1 ? "s" : ""}`,
            class: "status-upcoming",
            icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
        }
    }

    private escapeHtml(text: string): string {
        const div = document.createElement("div")
        div.textContent = text
        return div.innerHTML
    }
}
