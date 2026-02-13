import Link from "next/link";
import { StatusShell } from "@/components/status/status-shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, LogIn, RefreshCcw } from "lucide-react";

const MESSAGES: Record<number, { title: string; description: string; hint?: string }> = {
    401: {
        title: "You’re not signed in",
        description: "This page is only available to signed-in users.",
        hint: "Sign in and you’ll be redirected back here.",
    },
    403: {
        title: "Access denied",
        description: "You don’t have permission to view this page.",
        hint: "If you think this is a mistake, contact support at smarana.help@gmail.com.",
    },
    429: {
        title: "Too many requests",
        description: "You’re doing that a bit too fast. Please try again soon.",
        hint: "Wait a moment and refresh the page.",
    },
    500: {
        title: "Something went wrong",
        description: "We hit an unexpected error. Try again in a moment.",
        hint: "If it keeps happening, report it via our Contact page.",
    },
};

function safeNext(next: unknown) {
    if (typeof next !== "string") return "/dashboard";
    if (!next.startsWith("/")) return "/dashboard"; // prevents open redirects
    return next;
}

export default async function StatusPage({
    params,
    searchParams,
}: {
    params: Promise<{ code: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { code: codeStr } = await params;
    const { next: nextParam } = await searchParams;

    const code = Number(codeStr);
    const content = MESSAGES[code] ?? {
        title: "Something happened",
        description: "The requested action couldn’t be completed.",
        hint: "Try going back or returning home.",
    };

    const next = safeNext(nextParam);

    // Pick your sign-in URL:
    // Option A (NextAuth default):
    // const signInHref = `/api/auth/signin?callbackUrl=${encodeURIComponent(next)}`;
    // Option B (Custom Sign In Page):
    const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(next)}`;

    return (
        <StatusShell
            code={Number.isFinite(code) ? code : 500}
            title={content.title}
            description={content.description}
            hint={content.hint}
            actions={
                <>
                    {code === 401 ? (
                        <Button asChild className="rounded-full bg-[#BB7331] text-white hover:bg-[#BB7331]/90 shadow-lg shadow-primary/20 min-w-[160px]">
                            <Link href={signInHref}>
                                <LogIn className="w-4 h-4 mr-2" />
                                Sign in
                            </Link>
                        </Button>
                    ) : null}

                    <Button asChild variant="secondary" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white min-w-[160px]">
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Link>
                    </Button>

                    {code !== 401 && (
                        <Button asChild variant="ghost" className="rounded-full text-white/70 hover:bg-white/5 min-w-[160px]">
                            <Link href={next}>
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Try again
                            </Link>
                        </Button>
                    )}
                </>
            }
        />
    );
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
    const { code: codeStr } = await params;
    const code = Number(codeStr);
    const title = MESSAGES[code]?.title ?? "Status";
    return {
        title: `${code} • ${title} | Smarana`,
        robots: { index: false, follow: false }, // don’t index error pages
    };
}
