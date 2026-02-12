
import { Metadata } from "next";
import { User, Code2, Paintbrush, Coffee } from "lucide-react";

export const metadata: Metadata = {
    title: "Team",
    description:
        "Meet the team behind Smarana — built by Jash Karangiya with help from virtual interns Claude and Antigravity.",
};

const team = [
    {
        name: "Jash Karangiya",
        role: "Founder / Builder",
        superpower: "Ships fast, refines faster.",
        blurb: "Building Smarana to make algorithm retention feel effortless and consistent.",
        icon: User,
        color: "text-[#BB7331]",
        bg: "bg-[#BB7331]/20",
        ring: "ring-[#BB7331]/30"
    },
    {
        name: "Claude",
        role: "Virtual Intern (QA + Copy)",
        superpower: "Infinite patience, occasional hallucination.",
        blurb: "Helps sanity-check UX wording and edge cases. Drinks zero coffee, somehow still productive.",
        icon: Code2,
        color: "text-blue-400",
        bg: "bg-blue-400/20",
        ring: "ring-blue-400/30"
    },
    {
        name: "Antigravity",
        role: "Virtual Intern (Design + Polish)",
        superpower: "Pixel-perfect anxiety.",
        blurb: "Keeps the UI clean, aligned, and allergic to “generic dashboard energy.”",
        icon: Paintbrush,
        color: "text-purple-400",
        bg: "bg-purple-400/20",
        ring: "ring-purple-400/30"
    },
];

export default function TeamPage() {
    return (
        <div className="space-y-20 max-w-4xl mx-auto">
            {/* Hero */}
            <section className="text-center space-y-4 pt-10">
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                    Tiny team. Serious focus.
                </div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    Built in public. <span className="text-white/40">Focused on recall.</span>
                </h1>
                <div className="flex justify-center gap-2 pt-4">
                    {["Memory > Grind", "Focus-first UI", "No Fluff"].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 text-xs text-white/40">
                            {tag}
                        </span>
                    ))}
                </div>
            </section>

            {/* Team Cards */}
            <section className="grid gap-6 md:grid-cols-1">
                {team.map((p) => (
                    <div key={p.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.05]">
                        <div className="flex items-start gap-5">
                            <div className={`h-14 w-14 rounded-full ${p.bg} ring-1 ${p.ring} grid place-items-center shrink-0`}>
                                <p.icon className={`h-6 w-6 ${p.color}`} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                                    <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-white/60">
                                        {p.role}
                                    </span>
                                </div>
                                <p className="text-white/70 leading-relaxed text-sm">
                                    {p.blurb}
                                </p>
                                <div className="pt-2 flex items-center gap-2 text-xs text-white/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    <span className="uppercase tracking-wider font-medium">Superpower:</span>
                                    <span className="text-white/60 italic">{p.superpower}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* How we work */}
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-sm text-white/40 font-medium uppercase tracking-widest">How We Work</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Less noise, more recall", desc: "If a feature doesn't help you remember, we delete it." },
                        { title: "Polish > Clutter", desc: "We sweat the details so you don't have to fight the UI." },
                        { title: "Consistency over gimmicks", desc: "No gamification traps. Just habits that stick." }
                    ].map((item) => (
                        <div key={item.title} className="text-center p-6 rounded-2xl bg-white/[0.01] border border-white/5">
                            <h4 className="font-medium text-white/90 mb-2">{item.title}</h4>
                            <p className="text-sm text-white/50">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
