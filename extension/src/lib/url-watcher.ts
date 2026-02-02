/**
 * Watches for URL changes in SPAs like LeetCode where navigation
 * doesn't trigger a full page reload
 */
export function onUrlChange(callback: (url: string) => void): () => void {
    let lastUrl = location.href

    const interval = setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href
            callback(lastUrl)
        }
    }, 500)

    // Return cleanup function
    return () => clearInterval(interval)
}
