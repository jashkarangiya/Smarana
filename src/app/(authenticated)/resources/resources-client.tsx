"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Swords, GraduationCap, Search, PlusCircle } from "lucide-react";
import { SuggestResourceDialog } from "@/components/suggest-resource-dialog";

type ResourceCategory = "Interview" | "DSA Sheets" | "Competitive Programming";

type Resource = {
    id: string;
    title: string;
    category: ResourceCategory;
    description: string;
    tags: string[];
    href: string;
};

const RESOURCES: Resource[] = [
    {
        id: "neetcode-150",
        title: "NeetCode 150",
        category: "Interview",
        description: "Curated list of essential interview problems with explanations and structure.",
        tags: ["Patterns", "LeetCode"],
        href: "https://neetcode.io/practice",
    },
    {
        id: "neetcode-roadmap",
        title: "NeetCode Roadmap",
        category: "Interview",
        description: "Visual roadmap to learn DSA patterns in the optimal order for interviews.",
        tags: ["Roadmap", "Patterns"],
        href: "https://neetcode.io/roadmap",
    },
    {
        id: "striver-a2z",
        title: "Striver's A2Z DSA Sheet",
        category: "DSA Sheets",
        description: "Structured DSA sheet covering fundamentals → advanced topics with a guided progression.",
        tags: ["DSA", "Structured", "450+"],
        href: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2",
    },
    {
        id: "striver-sde",
        title: "Striver's SDE Sheet",
        category: "Interview",
        description: "Top 180 problems for SDE interviews, organized by topic.",
        tags: ["SDE", "Top 180"],
        href: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems",
    },
    {
        id: "striver-cp",
        title: "Striver's CP Sheet",
        category: "Competitive Programming",
        description: "Competitive programming sheet for coding rounds + contests (topic-wise).",
        tags: ["CP", "Topic-wise"],
        href: "https://takeuforward.org/interview-experience/strivers-cp-sheet",
    },
    {
        id: "cp31",
        title: "CP‑31 Sheet (TLE Eliminators)",
        category: "Competitive Programming",
        description: "Structured practice sheet with Codeforces focus (rating-based practice).",
        tags: ["Codeforces", "Rating-based"],
        href: "https://codeforces.com/blog/entry/139079",
    },
    {
        id: "cses",
        title: "CSES Problem Set",
        category: "Competitive Programming",
        description: "Classic competitive programming problem set covering all standard algorithms.",
        tags: ["Classic", "Algorithms"],
        href: "https://cses.fi/problemset/",
    },
    {
        id: "blind-75",
        title: "Blind 75",
        category: "Interview",
        description: "The original 75 LeetCode problems curated for FAANG interviews.",
        tags: ["FAANG", "Classic"],
        href: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions",
    },
];

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

export default function ResourcesClient() {
    const [query, setQuery] = React.useState("");
    const [active, setActive] = React.useState<ResourceCategory | "All">("All");

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return RESOURCES.filter((r) => {
            const matchesCategory = active === "All" ? true : r.category === active;
            const matchesQuery =
                !q ||
                r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.tags.some((t) => t.toLowerCase().includes(q));
            return matchesCategory && matchesQuery;
        });
    }, [query, active]);

    const categories: Array<ResourceCategory | "All"> = ["All", "Interview", "DSA Sheets", "Competitive Programming"];

    return (
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white/95">Resources</h1>
                    <p className="mt-1.5 text-sm text-white/50">
                        Curated DSA + CP sheets. We link out to the original creators.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <SuggestResourceDialog />

                    {/* Search */}
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search resources…"
                            className="pl-9 bg-white/[0.03] border-white/10 text-white/90 placeholder:text-white/35"
                        />
                    </div>
                </div>
            </div>

            {/* Category chips */}
            <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((c) => {
                    const isActive = active === c;
                    return (
                        <button
                            key={c}
                            onClick={() => setActive(c)}
                            className={[
                                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                                isActive
                                    ? "border-[#BB7331]/40 bg-[#BB7331]/15 text-white/90 shadow-sm"
                                    : "border-white/10 bg-white/[0.02] text-white/55 hover:bg-white/[0.05] hover:text-white/75",
                            ].join(" ")}
                        >
                            {c}
                        </button>
                    );
                })}
            </div>

            {/* Cards Grid */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((r) => (
                    <Card
                        key={r.id}
                        className="group border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 transition-all duration-200"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    {/* Category badge */}
                                    <div className="flex items-center gap-2">
                                        {categoryIcon(r.category)}
                                        <p className={`text-xs font-medium ${categoryColor(r.category)}`}>
                                            {r.category}
                                        </p>
                                    </div>

                                    {/* Title */}
                                    <h3 className="mt-2.5 text-base font-semibold text-white/90 truncate group-hover:text-white transition-colors">
                                        {r.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="mt-2 text-sm text-white/50 leading-relaxed line-clamp-2">
                                        {r.description}
                                    </p>
                                </div>

                                {/* External link button */}
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-[#BB7331]/20 hover:border-[#BB7331]/30 transition-all"
                                >
                                    <Link href={r.href} target="_blank" rel="noreferrer">
                                        <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-[#BB7331]" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Tags */}
                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {r.tags.map((t) => (
                                    <Badge
                                        key={t}
                                        variant="secondary"
                                        className="bg-white/[0.04] text-white/60 border border-white/10 text-[10px] px-2 py-0.5"
                                    >
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
                <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-white/20" />
                    <p className="mt-3 text-sm text-white/50">
                        No resources found. Try searching "DSA", "CP", or "NeetCode".
                    </p>
                </div>
            )}

            {/* Footer note */}
            <p className="mt-10 text-center text-xs text-white/35">
                All resources link to their original creators. We don't host any content.
            </p>
        </div>
    );
}
