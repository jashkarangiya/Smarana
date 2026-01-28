import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const method = req.method;
    const path = req.nextUrl.pathname;

    // 1. CSRF Protection for API Routes (Mutations only)
    // Skip GET, HEAD, OPTIONS
    // Skip NextAuth routes (/api/auth) which handle their own security
    if (
        path.startsWith("/api") &&
        !path.startsWith("/api/auth") &&
        !["GET", "HEAD", "OPTIONS"].includes(method)
    ) {
        const origin = req.headers.get("origin");
        const referer = req.headers.get("referer");
        const host = req.headers.get("host"); // e.g. localhost:3000

        // Strict overlap check: Origin or Referer must match Host
        // Note: In production, trustHost: true in authOptions is usually sufficient, 
        // but explicit middleware check is safer defense-in-depth.

        // We want to allow requests where origin includes the host.
        // In dev, host is localhost:3000, origin is http://localhost:3000

        let isSameOrigin = false;
        if (origin && host && origin.includes(host)) isSameOrigin = true;
        if (referer && host && referer.includes(host)) isSameOrigin = true;

        // Allow requests from Vercel preview URLs or configured domains
        // For now, strict same-origin:
        if (!isSameOrigin) {
            // Allow if specific API key present? (e.g. Cron)
            // Cron check happens later in the route handler, but we can verify generic CSRF here.
            // If it is a cron job, it might not have origin/referer.
            // Exception: Cron jobs often don't send Origin/Referer.
            // We can skip CSRF check if the route is /api/cron or /api/sync AND it has the CRON_SECRET header?
            // Better: Just apply strict CSRF to browser-initiated mutation paths.

            // If it's the cron path, we skip CSRF check here and let the route handler check the secret.
            if (path.startsWith("/api/cron") || path.startsWith("/api/sync")) {
                // pass
            } else {
                return NextResponse.json({ error: "Forbidden: CSRF check failed" }, { status: 403 });
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/api/:path*",
    ],
};
