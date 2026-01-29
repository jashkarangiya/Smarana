export async function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}) {
    const { timeout = 8000 } = options as any

    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    })

    clearTimeout(id)
    return response
}

export async function fetchWithRetry(resource: RequestInfo, options: RequestInit = {}, retries = 1) {
    try {
        return await fetchWithTimeout(resource, options)
    } catch (error) {
        if (retries > 0) {
            console.warn(`Fetch failed, retrying... (${retries} attempts left)`)
            return fetchWithRetry(resource, options, retries - 1)
        }
        throw error
    }
}
