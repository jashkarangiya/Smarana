import * as React from "react";
import { cn } from "@/lib/utils";

export function GlowFrame({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("relative z-0 mx-auto w-full max-w-5xl", className)}>
            {/* Glow layer (behind) - Conic gradient for continuous surround glow - Orange/Soft - Barely Visible - Fixed Opacity - Static */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] opacity-15">
                <div
                    className="
                        w-full h-full rounded-[32px]
                        bg-[conic-gradient(from_0deg_at_50%_50%,#BB7331_0%,#F97316_25%,#BB7331_50%,#F97316_75%,#BB7331_100%)]
                        blur-2xl
                    "
                />
            </div>

            {/* Soft outer halo - Orange - Barely Visible - Fixed Opacity - Static */}
            <div className="pointer-events-none absolute -inset-12 -z-20 rounded-[32px] opacity-10">
                <div
                    className="
                        w-full h-full rounded-[32px]
                        bg-[conic-gradient(from_180deg_at_50%_50%,#F97316_0%,#BB7331_25%,#F97316_50%,#BB7331_75%,#F97316_100%)]
                        blur-3xl
                    "
                />
            </div>

            {/* Border / edge highlight */}
            <div
                aria-hidden
                className="
                    pointer-events-none absolute inset-0
                    rounded-[28px] z-10
                    ring-1 ring-white/10
                "
            />

            {/* Image container */}
            <div className="relative z-10 overflow-hidden rounded-[28px] border border-white/10 shadow-2xl bg-black/50">
                {children}
            </div>
        </div>
    );
}
