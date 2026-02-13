"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StatusShell } from "@/components/status/status-shell";
import { Button } from "@/components/ui/button";
import { Home, RefreshCcw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <StatusShell
                    code={500}
                    title="Something went wrong"
                    description="We hit an unexpected issue. Try again or come back later."
                    hint="If it keeps happening, please contact support."
                    actions={
                        <>
                            <Button
                                onClick={() => reset()}
                                className="rounded-full bg-[#BB7331] text-white hover:bg-[#BB7331]/90 shadow-lg shadow-primary/20 min-w-[160px]"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white min-w-[160px]"
                            >
                                <Link href="/">
                                    <Home className="w-4 h-4 mr-2" />
                                    Go Home
                                </Link>
                            </Button>
                        </>
                    }
                />
            </body>
        </html>
    );
}
