import type { ProblemData } from "../lib/api"
import { getDifficultyColor, getPlatformName, type Platform } from "../lib/platform"

const OVERLAY_ID = "smarana-overlay"
const EMBER_ORANGE = "#BB7331"
const DARK_BG = "#1a1a1a"
const DARK_CARD = "#252525"

export type OverlayState =
    | { type: "loading" }
    | { type: "not-connected"; onConnect: () => void }
    | { type: "not-tracked"; platform: string; slug: string }
    | { type: "problem"; problem: ProblemData }
    | { type: "error"; message: string }

let currentState: OverlayState | null = null
let isCollapsed = false

/**
 * Create the overlay container if it doesn't exist
 */
export function createOverlay(): void {
    if (document.getElementById(OVERLAY_ID)) {
        return
    }

    const overlay = document.createElement("div")
    overlay.id = OVERLAY_ID
    overlay.innerHTML = getOverlayHTML({ type: "loading" })

    // Add styles
    const styles = document.createElement("style")
    styles.textContent = getOverlayStyles()
    overlay.appendChild(styles)

    document.body.appendChild(overlay)

    // Make it draggable
    makeDraggable(overlay)
}

/**
 * Update the overlay content
 */
export function updateOverlay(state: OverlayState): void {
    const overlay = document.getElementById(OVERLAY_ID)
    if (!overlay) {
        createOverlay()
        return updateOverlay(state)
    }

    currentState = state

    // Find the content container
    const content = overlay.querySelector(".smarana-content")
    if (content) {
        content.innerHTML = getContentHTML(state)
        attachEventListeners(overlay, state)
    }
}

/**
 * Remove the overlay from the page
 */
export function removeOverlay(): void {
    const overlay = document.getElementById(OVERLAY_ID)
    if (overlay) {
        overlay.remove()
    }
    currentState = null
}

/**
 * Toggle collapsed state
 */
function toggleCollapsed(): void {
    isCollapsed = !isCollapsed
    const overlay = document.getElementById(OVERLAY_ID)
    if (overlay) {
        overlay.classList.toggle("smarana-collapsed", isCollapsed)
    }
}

/**
 * Get the full overlay HTML structure
 */
function getOverlayHTML(state: OverlayState): string {
    return `
        <div class="smarana-header">
            <div class="smarana-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${EMBER_ORANGE}" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
                <span>Smarana</span>
            </div>
            <button class="smarana-toggle" aria-label="Toggle overlay">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 15l-6-6-6 6"></path>
                </svg>
            </button>
        </div>
        <div class="smarana-content">
            ${getContentHTML(state)}
        </div>
    `
}

/**
 * Get the content HTML based on state
 */
function getContentHTML(state: OverlayState): string {
    switch (state.type) {
        case "loading":
            return `
                <div class="smarana-loading">
                    <div class="smarana-spinner"></div>
                    <span>Loading...</span>
                </div>
            `

        case "not-connected":
            return `
                <div class="smarana-empty">
                    <p>Connect to see your notes and track this problem</p>
                    <button class="smarana-btn smarana-btn-primary smarana-connect-btn">
                        Connect Smarana
                    </button>
                </div>
            `

        case "not-tracked":
            return `
                <div class="smarana-empty">
                    <p>This problem is not in your Smarana list</p>
                    <a href="https://smarana.app/add" target="_blank" class="smarana-btn smarana-btn-secondary">
                        Add to Smarana
                    </a>
                </div>
            `

        case "problem":
            return getProblemHTML(state.problem)

        case "error":
            return `
                <div class="smarana-error">
                    <span>${state.message}</span>
                </div>
            `

        default:
            return ""
    }
}

/**
 * Get the HTML for a tracked problem
 */
function getProblemHTML(problem: ProblemData): string {
    const diffColor = getDifficultyColor(problem.difficulty)
    const reviewStatus = getReviewStatus(problem)

    let notesSection = ""
    if (problem.notes && problem.notes.trim()) {
        notesSection = `
            <div class="smarana-section">
                <div class="smarana-section-header">Notes</div>
                <div class="smarana-notes">${escapeHtml(problem.notes)}</div>
            </div>
        `
    }

    let solutionSection = ""
    if (problem.solution !== null) {
        solutionSection = `
            <div class="smarana-section">
                <div class="smarana-section-header">
                    <span>Solution</span>
                    <button class="smarana-toggle-solution" data-show="false">Show</button>
                </div>
                <div class="smarana-solution" style="display: none;">
                    <pre>${escapeHtml(problem.solution || "")}</pre>
                </div>
            </div>
        `
    }

    return `
        <div class="smarana-problem">
            <div class="smarana-problem-header">
                <span class="smarana-difficulty" style="color: ${diffColor}">
                    ${problem.difficulty}
                </span>
                <span class="smarana-reviews">
                    ${problem.reviewCount} review${problem.reviewCount !== 1 ? "s" : ""}
                </span>
            </div>

            <div class="smarana-status ${reviewStatus.class}">
                ${reviewStatus.icon}
                <span>${reviewStatus.text}</span>
            </div>

            ${notesSection}
            ${solutionSection}

            <a href="${problem.smaranaUrl}" target="_blank" class="smarana-btn smarana-btn-primary smarana-open-btn">
                Open in Smarana
            </a>
        </div>
    `
}

/**
 * Get review status info
 */
function getReviewStatus(problem: ProblemData): { text: string; class: string; icon: string } {
    if (!problem.nextReviewAt) {
        return {
            text: "Not scheduled",
            class: "smarana-status-neutral",
            icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
            </svg>`,
        }
    }

    const nextReview = new Date(problem.nextReviewAt)
    const now = new Date()
    const diffDays = Math.ceil((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
        return {
            text: "Review overdue!",
            class: "smarana-status-overdue",
            icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>`,
        }
    }

    if (diffDays === 0) {
        return {
            text: "Due today",
            class: "smarana-status-due",
            icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>`,
        }
    }

    return {
        text: `Due in ${diffDays} day${diffDays !== 1 ? "s" : ""}`,
        class: "smarana-status-upcoming",
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>`,
    }
}

/**
 * Attach event listeners to the overlay
 */
function attachEventListeners(overlay: HTMLElement, state: OverlayState): void {
    // Toggle button
    const toggleBtn = overlay.querySelector(".smarana-toggle")
    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleCollapsed)
    }

    // Connect button
    if (state.type === "not-connected") {
        const connectBtn = overlay.querySelector(".smarana-connect-btn")
        if (connectBtn) {
            connectBtn.addEventListener("click", state.onConnect)
        }
    }

    // Solution toggle
    if (state.type === "problem") {
        const toggleSolutionBtn = overlay.querySelector(".smarana-toggle-solution")
        if (toggleSolutionBtn) {
            toggleSolutionBtn.addEventListener("click", () => {
                const solutionDiv = overlay.querySelector(".smarana-solution") as HTMLElement
                const isShowing = toggleSolutionBtn.getAttribute("data-show") === "true"

                if (solutionDiv) {
                    solutionDiv.style.display = isShowing ? "none" : "block"
                    toggleSolutionBtn.textContent = isShowing ? "Show" : "Hide"
                    toggleSolutionBtn.setAttribute("data-show", isShowing ? "false" : "true")
                }
            })
        }
    }
}

/**
 * Make the overlay draggable
 */
function makeDraggable(overlay: HTMLElement): void {
    const header = overlay.querySelector(".smarana-header") as HTMLElement
    if (!header) return

    let isDragging = false
    let startX = 0
    let startY = 0
    let startRight = 0
    let startBottom = 0

    header.addEventListener("mousedown", (e) => {
        // Don't drag if clicking a button
        if ((e.target as HTMLElement).closest("button")) return

        isDragging = true
        startX = e.clientX
        startY = e.clientY

        const rect = overlay.getBoundingClientRect()
        startRight = window.innerWidth - rect.right
        startBottom = window.innerHeight - rect.bottom

        header.style.cursor = "grabbing"
    })

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return

        const deltaX = startX - e.clientX
        const deltaY = startY - e.clientY

        const newRight = Math.max(0, startRight + deltaX)
        const newBottom = Math.max(0, startBottom + deltaY)

        overlay.style.right = `${newRight}px`
        overlay.style.bottom = `${newBottom}px`
    })

    document.addEventListener("mouseup", () => {
        isDragging = false
        header.style.cursor = "grab"
    })
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

/**
 * Get the overlay styles
 */
function getOverlayStyles(): string {
    return `
        #${OVERLAY_ID} {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px;
            max-height: 500px;
            background: ${DARK_BG};
            border: 1px solid #333;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            color: #e0e0e0;
            z-index: 999999;
            overflow: hidden;
            transition: max-height 0.2s ease;
        }

        #${OVERLAY_ID}.smarana-collapsed {
            max-height: 44px;
        }

        #${OVERLAY_ID}.smarana-collapsed .smarana-content {
            display: none;
        }

        #${OVERLAY_ID}.smarana-collapsed .smarana-toggle svg {
            transform: rotate(180deg);
        }

        .smarana-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: ${DARK_CARD};
            border-bottom: 1px solid #333;
            cursor: grab;
        }

        .smarana-logo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            color: ${EMBER_ORANGE};
        }

        .smarana-toggle {
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
        }

        .smarana-toggle:hover {
            color: #fff;
        }

        .smarana-toggle svg {
            transition: transform 0.2s;
        }

        .smarana-content {
            padding: 16px;
            overflow-y: auto;
            max-height: 400px;
        }

        .smarana-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 24px;
            color: #888;
        }

        .smarana-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #333;
            border-top-color: ${EMBER_ORANGE};
            border-radius: 50%;
            animation: smarana-spin 0.8s linear infinite;
        }

        @keyframes smarana-spin {
            to { transform: rotate(360deg); }
        }

        .smarana-empty {
            text-align: center;
            padding: 16px 0;
        }

        .smarana-empty p {
            margin: 0 0 16px;
            color: #888;
        }

        .smarana-error {
            color: #ff6b6b;
            text-align: center;
            padding: 16px 0;
        }

        .smarana-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 16px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            border: none;
        }

        .smarana-btn-primary {
            background: ${EMBER_ORANGE};
            color: #fff;
        }

        .smarana-btn-primary:hover {
            background: #d4843a;
        }

        .smarana-btn-secondary {
            background: ${DARK_CARD};
            color: #e0e0e0;
            border: 1px solid #444;
        }

        .smarana-btn-secondary:hover {
            background: #333;
        }

        .smarana-problem-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .smarana-difficulty {
            font-weight: 600;
        }

        .smarana-reviews {
            color: #888;
            font-size: 12px;
        }

        .smarana-status {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 13px;
            margin-bottom: 16px;
        }

        .smarana-status-overdue {
            background: rgba(255, 107, 107, 0.15);
            color: #ff6b6b;
        }

        .smarana-status-due {
            background: rgba(255, 192, 30, 0.15);
            color: #ffc01e;
        }

        .smarana-status-upcoming {
            background: rgba(0, 184, 163, 0.15);
            color: #00b8a3;
        }

        .smarana-status-neutral {
            background: rgba(136, 136, 136, 0.15);
            color: #888;
        }

        .smarana-section {
            margin-bottom: 16px;
        }

        .smarana-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            font-weight: 600;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .smarana-toggle-solution {
            background: none;
            border: none;
            color: ${EMBER_ORANGE};
            cursor: pointer;
            font-size: 12px;
            padding: 0;
        }

        .smarana-toggle-solution:hover {
            text-decoration: underline;
        }

        .smarana-notes {
            background: ${DARK_CARD};
            border-radius: 8px;
            padding: 12px;
            font-size: 13px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-break: break-word;
        }

        .smarana-solution {
            background: ${DARK_CARD};
            border-radius: 8px;
            padding: 12px;
            overflow-x: auto;
        }

        .smarana-solution pre {
            margin: 0;
            font-family: 'Fira Code', 'Monaco', monospace;
            font-size: 12px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-break: break-word;
        }

        .smarana-open-btn {
            width: 100%;
        }
    `
}
