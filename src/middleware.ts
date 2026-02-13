import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const isLoggedIn = !!token;

    const { pathname, search } = req.nextUrl;

    // Define protected routes
    const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/problems") ||
        pathname.startsWith("/review") ||
        pathname.startsWith("/schedule") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/admin");

    if (!isLoggedIn && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = "/status/401";
        url.searchParams.set("next", pathname + search);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/problems/:path*",
        "/review/:path*",
        "/schedule/:path*",
        "/settings/:path*",
        "/admin/:path*",
    ],
};
