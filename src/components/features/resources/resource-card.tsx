"use client";

import Link from "next/link";
import { ExternalLink, GraduationCap, BookOpen, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

export type ResourceCategory = "Interview" | "DSA Sheets" | "Competitive Programming";

export type Resource = {
    id: string;
    title: string;
    category: ResourceCategory;
    description: string;
    tags: string[];
    href: string;
};

function categoryIcon(cat: ResourceCategory) {
    switch (cat) {
        case "Interview":
            return <GraduationCap className="h-4 w-4 text-amber-500/80" />;
        case "DSA Sheets":
            return <BookOpen className="h-4 w-4 text-emerald-500/80" />;
        case "Competitive Programming":
            return <Swords className="h-4 w-4 text-rose-500/80" />;
    }
}

function categoryColor(cat: ResourceCategory) {
    switch (cat) {
        case "Interview":
            return "text-amber-500/70";
        case "DSA Sheets":
            return "text-emerald-500/70";
        case "Competitive Programming":
            return "text-rose-500/70";
    }
}

export function ResourceCard({ r }: { r: Resource }) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-white/10",
                "bg-white/[0.03] p-5 transition-all duration-300",
                "hover:bg-white/[0.05] hover:border-[#BB7331]/30",
                "active:scale-[0.99] will-change-transform",
                "flex flex-col h-full"
            )}
        >
            {/* The invisible full-card link (stretched link) */}
            <Link
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "absolute inset-0 z-10 rounded-2xl",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BB7331]/35",
                    "focus-visible:ring-offset-0"
                )}
                aria-label={`Open resource: ${r.title}`}
            >
                <span className="sr-only">Open {r.title}</span>
            </Link>

            {/* Content sits under the link overlay */}
            <div className="relative z-0 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    {r.category ? (
                        <div className="flex items-center gap-2">
                            {categoryIcon(r.category)}
                            <span className={cn("text-xs font-medium truncate", categoryColor(r.category))}>{r.category}</span>
                        </div>
                    ) : null}

                    <h3 className="mt-2 truncate text-lg font-semibold text-white/90 group-hover:text-white transition-colors">
                        {r.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55 group-hover:text-white/70 transition-colors">
                        {r.description}
                    </p>
                </div>

                {/* Make icon purely visual (the full card already opens) */}
                <div
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        "border border-white/10 bg-black/20 text-white/65 transition-colors",
                        "group-hover:border-[#BB7331]/25 group-hover:text-[#BB7331] group-hover:bg-[#BB7331]/10"
                    )}
                    aria-hidden="true"
                >
                    <ExternalLink className="h-4 w-4" />
                </div>
            </div>

            {r.tags?.length ? (
                <div className="relative z-0 mt-auto pt-4 flex flex-wrap gap-2">
                    {r.tags.map((t) => (
                        <span
                            key={t}
                            className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] sm:text-xs text-white/60"
                        >
                            {t}
                        </span>
                    ))}
                </div>
            ) : null}

            {/* Optional: subtle “hint” on hover */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="h-full bg-gradient-to-t from-[#BB7331]/5 to-transparent" />
            </div>
        </div>
    );
}
