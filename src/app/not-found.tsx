
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-80px)] bg-black text-white flex items-center justify-center px-6">
            <Card className="relative w-full max-w-lg border-white/10 bg-white/[0.03] p-8 overflow-hidden text-center md:text-left">
                <div className="pointer-events-none absolute inset-0 opacity-20
          bg-[radial-gradient(circle_at_top,#BB7331_0%,transparent_55%)]" />

                <p className="text-sm text-white/50 font-mono">404</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
                <p className="mt-3 text-white/60 leading-relaxed">
                    That page doesn’t exist (or it moved). Let’s get you back on track.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Button asChild className="bg-[#BB7331] text-black hover:bg-[#BB7331]/90 font-medium">
                        <Link href="/">Go Home</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/10 bg-transparent hover:bg-white/5 text-white">
                        <Link href="/dashboard">Dashboard</Link>
                    </Button>
                </div>
            </Card>
        </div>
    );
}
