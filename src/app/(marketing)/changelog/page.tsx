import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Changelog · Smarana",
    description: "Product updates and improvements to Smarana.",
};

const changelog = [
    {
        version: "0.2",
        date: "Jan 29, 2026",
        title: "Polish & Filters",
        items: [
            "Advanced filtering system for problems",
            "Premium UI polish for Review/Problems pages",
            "Added marketing pages (About, Team, etc.)",
        ],
    },
    {
        version: "0.1",
        date: "Jan 15, 2026",
        title: "Initial Release",
        items: [
            "Core spaced repetition algorithm",
            "Dashboard with insights",
            "Problem management",
            "Review session mode",
        ],
    },
];

export default function ChangelogPage() {
    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            {/* HERO */}
            <Card className="relative overflow-hidden border-white/10 bg-white/[0.03] p-8 md:p-10">
                <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,#BB7331_0%,transparent_55%)]" />
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Changelog</h1>
                <p className="mt-3 max-w-2xl text-white/60 text-lg">
                    The journey of building Smarana — transparent updates and steady polish.
                </p>
            </Card>

            {/* TIMELINE */}
            <div className="space-y-8">
                {changelog.map((entry) => (
                    <div key={entry.version} className="relative pl-8 md:pl-10">
                        {/* vertical line */}
                        <div className="absolute left-3 top-0 h-full w-px bg-white/10" />
                        {/* dot */}
                        <div className="absolute left-3 top-6 h-3 w-3 -translate-x-1/2 rounded-full bg-[#BB7331] shadow-[0_0_0_4px_rgba(187,115,49,0.12)]" />

                        <Card className="border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.04] transition-colors">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="rounded-full border border-[#BB7331]/30 bg-[#BB7331]/10 px-3 py-1 text-sm text-[#BB7331] font-mono font-medium">
                                    v{entry.version}
                                </span>
                                <span className="text-sm text-white/50 font-mono">{entry.date}</span>
                            </div>

                            <h2 className="text-xl font-semibold text-white/90">
                                {entry.title}
                            </h2>

                            <ul className="mt-4 space-y-2 text-white/60 list-disc pl-5">
                                {entry.items.map((i) => (
                                    <li key={i} className="pl-1">{i}</li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
