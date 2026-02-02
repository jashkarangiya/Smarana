import { getAuthStatus, connect, disconnect } from "../lib/messaging"

const DASHBOARD_URL = "https://smarana.vercel.app/dashboard"
const SETTINGS_URL = "https://smarana.vercel.app/profile"

async function init() {
    const content = document.getElementById("content")
    if (!content) return

    try {
        const status = await getAuthStatus()

        if (status.isAuthenticated) {
            renderConnected(content, status.user)
        } else {
            renderNotConnected(content)
        }
    } catch (error) {
        console.error("[Smarana Popup] Error:", error)
        renderError(content)
    }
}

function renderNotConnected(container: HTMLElement) {
    container.innerHTML = `
        <div class="not-connected">
            <div class="not-connected-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 8v4"></path>
                    <path d="M12 16h.01"></path>
                </svg>
            </div>
            <h2>Not Connected</h2>
            <p>Connect your Smarana account to see your notes and review status on problem pages.</p>
            <button id="connect-btn" class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Connect to Smarana
            </button>
        </div>
        <div class="footer">
            <p>Don't have an account? <a href="https://smarana.vercel.app" target="_blank">Sign up free</a></p>
        </div>
    `

    const connectBtn = document.getElementById("connect-btn")
    connectBtn?.addEventListener("click", handleConnect)
}

function renderConnected(
    container: HTMLElement,
    user?: { username: string | null; email: string | null }
) {
    const displayName = user?.username || user?.email || "User"
    const email = user?.email || ""

    container.innerHTML = `
        <div class="connected">
            <div class="user-info">
                <div class="user-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <span class="user-name">${escapeHtml(displayName)}</span>
                ${email ? `<span class="user-email">${escapeHtml(email)}</span>` : ""}
            </div>

            <div class="status-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Connected
            </div>

            <div class="links">
                <a href="${DASHBOARD_URL}" target="_blank" class="link">
                    <span class="link-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Dashboard
                    </span>
                    <span class="link-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </span>
                </a>
                <a href="${SETTINGS_URL}" target="_blank" class="link">
                    <span class="link-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Settings
                    </span>
                    <span class="link-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </span>
                </a>
            </div>

            <button id="disconnect-btn" class="btn btn-danger" style="margin-top: 16px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Disconnect
            </button>
        </div>
    `

    const disconnectBtn = document.getElementById("disconnect-btn")
    disconnectBtn?.addEventListener("click", handleDisconnect)
}

function renderError(container: HTMLElement) {
    container.innerHTML = `
        <div class="not-connected">
            <div class="not-connected-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </div>
            <h2>Something went wrong</h2>
            <p>Unable to check connection status. Please try again.</p>
            <button id="retry-btn" class="btn btn-secondary">
                Retry
            </button>
        </div>
    `

    const retryBtn = document.getElementById("retry-btn")
    retryBtn?.addEventListener("click", () => init())
}

async function handleConnect() {
    const content = document.getElementById("content")
    if (!content) return

    content.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `

    try {
        await connect()
        // The connect flow opens a new tab, close the popup
        window.close()
    } catch (error) {
        console.error("[Smarana Popup] Connect error:", error)
        renderNotConnected(content)
    }
}

async function handleDisconnect() {
    const content = document.getElementById("content")
    if (!content) return

    content.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `

    try {
        await disconnect()
        renderNotConnected(content)
    } catch (error) {
        console.error("[Smarana Popup] Disconnect error:", error)
        init()
    }
}

function escapeHtml(text: string): string {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

// Listen for auth success from background
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "AUTH_SUCCESS") {
        init()
    }
})

// Initialize on load
document.addEventListener("DOMContentLoaded", init)
