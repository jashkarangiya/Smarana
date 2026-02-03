/**
 * Watches for URL changes in SPAs like LeetCode, Codeforces, AtCoder
 * where navigation doesn't trigger a full page reload.
 *
 * Uses multiple detection methods:
 * 1. Patches history.pushState and history.replaceState
 * 2. Listens to popstate events (back/forward navigation)
 * 3. Polling fallback for edge cases
 */
export function onUrlChange(callback: (url: string) => void): () => void {
    let lastUrl = location.href

    const notifyChange = () => {
        if (location.href !== lastUrl) {
            lastUrl = location.href
            callback(lastUrl)
        }
    }

    // Patch pushState
    const originalPushState = history.pushState.bind(history)
    history.pushState = function (...args) {
        const result = originalPushState(...args)
        notifyChange()
        return result
    }

    // Patch replaceState
    const originalReplaceState = history.replaceState.bind(history)
    history.replaceState = function (...args) {
        const result = originalReplaceState(...args)
        notifyChange()
        return result
    }

    // Listen for popstate (back/forward button)
    const handlePopState = () => notifyChange()
    window.addEventListener("popstate", handlePopState)

    // Polling fallback (some sites use other navigation methods)
    const interval = setInterval(notifyChange, 1000)

    // Return cleanup function
    return () => {
        history.pushState = originalPushState
        history.replaceState = originalReplaceState
        window.removeEventListener("popstate", handlePopState)
        clearInterval(interval)
    }
}
