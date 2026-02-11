/**
 * Returns the application's base URL.
 * Works in both production (Vercel) and local development.
 */
export function getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_APP_URL)
        return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")

    if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "")

    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "")

    // Vercel provides VERCEL_URL without protocol
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

    return "http://localhost:3000" // dev fallback
}
