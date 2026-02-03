import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Team",
    description: "The small team behind Smarana.",
};

const team = [
    {
        name: "JK",
        role: "Founder / Builder",
        blurb: "Building Smarana to make algorithm retention feel effortless and consistent.",
    },
    {
        name: "Claude",
        role: "Virtual Intern (QA + Copy)",
        blurb: "Helps sanity-check UX wording and edge cases. Drinks zero coffee, somehow still productive.",
    },
    {
        name: "Antigravity",
        role: "Virtual Intern (Design + Polish)",
        blurb: "Keeps the UI clean, aligned, and allergic to “generic dashboard energy.”",
    },
];

export default function TeamPage() {
    return (
        <div className="space-y-10">
            <section>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Team <span className="text-[#BB7331]">Smarana</span>
                </h1>
                <p className="mt-3 max-w-2xl text-white/65">
                    A tiny team with a simple mission: make remembering patterns feel natural.
                    (Yes, the interns are virtual. They’re still extremely opinionated.)
                </p>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
                {team.map((p) => (
                    <div key={p.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold">{p.name}</div>
                            <div className="text-xs rounded-full border border-white/10 bg-black/40 px-3 py-1 text-white/60">
                                {p.role}
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-white/60 leading-relaxed">{p.blurb}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}
