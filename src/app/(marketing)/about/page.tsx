import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About • Smaarna",
    description: "Why Smarana exists and how it helps you retain coding patterns with spaced repetition.",
};

export default function AboutPage() {
    return (
        <div className="space-y-12">
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                    About <span className="text-[#BB7331]">Smarana</span>
                </h1>
                <p className="mt-4 max-w-2xl text-white/65 leading-relaxed">
                    Smarana (स्मरण) means <span className="text-white/80">“remembrance.”</span>
                    It’s a simple idea: you shouldn’t have to re-learn the same algorithm patterns every few weeks.
                    If you’ve solved it once, you should be able to recall it when it matters.
                </p>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
                {[
                    {
                        title: "The problem",
                        body: "You solve a problem, understand it… and forget the approach later. Interview prep becomes repeat work.",
                    },
                    {
                        title: "The approach",
                        body: "Smarana schedules reviews using spaced repetition so you revisit problems at the right time—not randomly.",
                    },
                    {
                        title: "The goal",
                        body: "Build durable pattern memory: the kind that shows up under pressure when time is limited.",
                    },
                ].map((x) => (
                    <div key={x.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="text-sm font-semibold text-white/90">{x.title}</div>
                        <p className="mt-2 text-sm text-white/60 leading-relaxed">{x.body}</p>
                    </div>
                ))}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
                <h2 className="text-xl font-semibold">Why I built it</h2>
                <p className="mt-3 text-white/65 leading-relaxed">
                    I built Smarana while practicing DSA consistently and noticing a pattern:
                    progress wasn’t blocked by learning new concepts—it was blocked by forgetting solutions I’d already solved.
                    Smarana exists to make that retention automatic.
                </p>

                <div className="mt-6 text-sm text-white/55">
                    No inflated claims. No fake numbers. Just a clean system that respects focus.
                </div>
            </section>
        </div>
    );
}
