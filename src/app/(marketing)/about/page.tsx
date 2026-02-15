
import { Metadata } from "next";
import Image from "next/image";
import { Brain, Clock, Zap, Target, Layout, ListChecks, History } from "lucide-react";

export const metadata: Metadata = {
    title: "About",
    description: "Why Smarana exists: built by Jash Karangiya to stop forgetting solved algorithm patterns and make reviews automatic.",
};

export default function AboutPage() {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-20 md:space-y-32">
            {/* Section 1: Hero split (Origin Story) */}
            <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-[#BB7331]">About Smarana</p>
                        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                            Not to do more problems. <br />
                            <span className="text-white/50">To remember the ones you solved.</span>
                        </h1>
                    </div>
                    <p className="text-lg text-white/60 leading-relaxed max-w-md">
                        I started Smarana because I needed a revision reminder.
                        I’d solve problems, feel confident, and then blank out weeks later.
                        Smarana began as a small system to revisit what I already knew, and grew into a spaced repetition layer for algorithms.
                    </p>
                    <p className="text-sm text-white/40 italic">
                        Credit to Ayush Luhar for the name.
                    </p>
                </div>

                <div className="relative rounded-3xl border border-white/10 bg-black/40 shadow-2xl overflow-hidden w-full">
                    <Image
                        src="/274_1x_shots_so.png"
                        alt="Smarana Interface"
                        width={0}
                        height={0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="w-full h-auto"
                        priority
                    />
                    {/* Gradient Overlay for better integration */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
            </section>

            {/* Section 2: Timeline (Evolution) */}
            <section className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-10 text-center">How it evolved</h2>
                <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-gradient-to-b before:from-[#BB7331] before:via-white/10 before:to-transparent">
                    {/* Step 1 */}
                    <div className="relative flex gap-6 items-start">
                        <div className="relative z-10 h-10 w-10 rounded-full bg-black border border-[#BB7331] shadow-[0_0_10px_rgba(187,115,49,0.3)] flex items-center justify-center shrink-0">
                            <Brain className="h-5 w-5 text-[#BB7331]" />
                        </div>
                        <div className="pt-2 pb-6">
                            <h3 className="text-lg font-medium text-white">The Frustration</h3>
                            <p className="mt-1 text-white/60">"Solved, forgot, re-solve." The endless cycle of LeetCode grind with diminishing returns.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex gap-6 items-start">
                        <div className="relative z-10 h-10 w-10 rounded-full bg-black border border-white/20 flex items-center justify-center shrink-0">
                            <Zap className="h-5 w-5 text-white/70" />
                        </div>
                        <div className="pt-2 pb-6">
                            <h3 className="text-lg font-medium text-white">The MVP</h3>
                            <p className="mt-1 text-white/60">A simple script for revision reminders and quick notes. No bells, no whistles.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex gap-6 items-start">
                        <div className="relative z-10 h-10 w-10 rounded-full bg-black border border-white/20 flex items-center justify-center shrink-0">
                            <Target className="h-5 w-5 text-white/70" />
                        </div>
                        <div className="pt-2 pb-6">
                            <h3 className="text-lg font-medium text-white">The Product</h3>
                            <p className="mt-1 text-white/60">A focused spaced-repetition loop that compounds knowledge over time.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Cards (Problem / Approach / Goal) */}
            <section className="grid gap-6 md:grid-cols-3">
                {[
                    {
                        icon: Layout,
                        title: "The Problem",
                        body: "Interview prep often becomes 'cramming and forgetting.' You solve hundreds of problems but retain only a fraction.",
                    },
                    {
                        icon: History,
                        title: "The Approach",
                        body: "Smarana brings spaced repetition to coding. We schedule reviews based on your confidence, ensuring you revisit patterns just before you forget them.",
                    },
                    {
                        icon: Target,
                        title: "The Goal",
                        body: "Build durable pattern intuition. When you see a problem in an interview, the solution path should feel obvious, not memorable.",
                    },
                ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] flex flex-col h-full">
                        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 text-[#BB7331]">
                            <item.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-white/60 leading-relaxed flex-1">
                            {item.body}
                        </p>
                    </div>
                ))}
            </section>

            {/* Section 4: Product Snapshots */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-white/40">Product Design</h3>
                    <span className="text-xs text-white/40">Focus-first Interface</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group space-y-3">
                        <div className="aspect-video rounded-xl bg-white/[0.02] relative overflow-hidden">
                            <Image
                                src="/823_1x_shots_so.png"
                                alt="Dashboard Overview"
                                fill
                                className="object-cover object-top"
                            />
                        </div>
                        <p className="text-xs text-center text-white/40 group-hover:text-white/60 transition-colors">Dashboard Overview</p>
                    </div>
                    <div className="group space-y-3">
                        <div className="aspect-video rounded-xl bg-white/[0.02] relative overflow-hidden group-hover:ring-1 group-hover:ring-white/10 transition-all">
                            <Image
                                src="/review-session.png"
                                alt="Review Session"
                                fill
                                className="object-cover object-top"
                            />
                        </div>
                        <p className="text-xs text-center text-white/40 group-hover:text-white/60 transition-colors">Review Session</p>
                    </div>
                    <div className="group space-y-3">
                        <div className="aspect-video rounded-xl bg-white/[0.02] relative overflow-hidden group-hover:ring-1 group-hover:ring-white/10 transition-all">
                            <Image
                                src="/extension-overlay.png"
                                alt="Extension Overlay"
                                fill
                                className="object-cover object-top"
                            />
                        </div>
                        <p className="text-xs text-center text-white/40 group-hover:text-white/60 transition-colors">Extension Overlay</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
