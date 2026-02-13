import Link from "next/link";
import { StatusShell } from "@/components/status/status-shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 • Page Not Found | Smarana",
    description: "The page you’re looking for doesn’t exist.",
};

export default function NotFound() {
    return (
        <StatusShell
            code={404}
            title="Page not found"
            description="The page you’re looking for doesn’t exist or has moved."
            hint="Check the URL, or jump back to the dashboard."
            actions={
                <>
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full bg-[#BB7331] text-white hover:bg-[#BB7331]/90 shadow-lg shadow-primary/20 min-w-[160px]"
                    >
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Return to Root
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white min-w-[160px]"
                    >
                        <Link href="/dashboard">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </>
            }
        />
    );
}
