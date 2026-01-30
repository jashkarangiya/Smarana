import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
    title: "Changelog • Smarana",
    description: "Updates and improvements to Smarana.",
};

const changes = [
    {
        version: "v0.2",
        date: "Jan 29, 2026",
        title: "Polish & Filters",
        items: [
            "Advanced filtering system for problems",
            "Premium UI polish for Review/Problems pages",
            "Added marketing pages (About, Team, etc.)"
        ]
    },
    {
        version: "v0.1",
        date: "Jan 15, 2026",
        title: "Initial Release",
        items: [
            "Core spaced repetition algorithm",
            "Dashboard with insights",
            "Problem management",
            "Review session mode"
        ]
    }
];

export default function ChangelogPage() {
    return (
        <div className="space-y-12 max-w-3xl">
            <section>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Changelog
                </h1>
                <p className="mt-4 text-white/65 leading-relaxed">
                    The journey of building Smarana. Transparent updates.
                </p>
            </section>

            <section className="space-y-12">
                {changes.map((release) => (
                    <div key={release.version} className="relative border-l border-white/10 pl-8 ml-2">
                        <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-[#BB7331]" />

                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="border-[#BB7331]/30 text-[#BB7331] font-mono">
                                {release.version}
                            </Badge>
                            <span className="text-sm text-white/40 font-mono">{release.date}</span>
                        </div>

                        <h3 className="text-xl font-medium text-white mb-4">{release.title}</h3>

                        <ul className="list-disc pl-5 space-y-2 text-white/70">
                            {release.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>
        </div>
    );
}
