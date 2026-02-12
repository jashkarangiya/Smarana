import { Metadata } from "next";
import Link from "next/link";
import { Chrome, Puzzle, Check, Monitor, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Browser Extension",
    description: "Get the Smarana browser extension for instant access to your notes, solutions, and review status while solving problems on any platform.",
};

const PLATFORMS = [
    { name: "LeetCode", domain: "leetcode.com" },
    { name: "Codeforces", domain: "codeforces.com" },
    { name: "AtCoder", domain: "atcoder.jp" },
    { name: "CodeChef", domain: "codechef.com" },
];

const FEATURES = [
    {
        icon: Monitor,
        title: "Floating Overlay",
        description: "A sleek bubble sits in the corner of your coding page, expanding when you need it.",
    },
    {
        icon: Zap,
        title: "Instant Access",
        description: "View your notes, solution, and review status without leaving the problem page.",
    },
    {
        icon: Puzzle,
        title: "Multi-Platform",
        description: "Works on LeetCode, Codeforces, AtCoder, CodeChef — and more coming soon.",
    },
    {
        icon: Shield,
        title: "Privacy First",
        description: "Your data stays encrypted. The extension only talks to Smarana servers.",
    },
];

const STEPS = [
    {
        step: "01",
        title: "Install the extension",
        description: "Add Smarana Companion from the Chrome Web Store — one click, no manual setup.",
    },
    {
        step: "02",
        title: "Connect your account",
        description: "Click the extension icon and sign in. A secure token links it to your Smarana account.",
    },
    {
        step: "03",
        title: "Start solving",
        description: "Visit any supported problem page. The overlay appears automatically when you're on a tracked problem.",
    },
];

export default function ExtensionPage() {
    return (
        <div className="space-y-16 pb-8">
            {/* Hero Section */}
            <section className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#BB7331]/30 bg-[#BB7331]/10 text-[#BB7331] text-sm font-medium">
                    <Chrome className="h-4 w-4" />
                    Browser Extension
                </div>

                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                    Your notes, right where you{" "}
                    <span className="text-[#BB7331]">solve</span>
                </h1>

                <p className="max-w-xl mx-auto text-white/60 leading-relaxed">
                    The Smarana extension brings your problem notes, solutions, and review status directly to LeetCode, Codeforces, AtCoder, and CodeChef.
                </p>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Button
                        size="lg"
                        className="h-12 px-6 text-base font-medium rounded-full shadow-lg shadow-primary/20"
                        asChild
                    >
                        <a href="https://chromewebstore.google.com/detail/smarana-companion/mbbhnangobklngdbmbjolbinofdaelnh" target="_blank" rel="noopener noreferrer">
                            Add to Chrome
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="h-12 px-6 text-base font-medium rounded-full border-white/10 hover:bg-white/5"
                        asChild
                    >
                        <Link href="/register">
                            Create Account
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Preview Section */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">
                            A floating companion for your practice
                        </h2>
                        <p className="text-white/60 leading-relaxed">
                            When you visit a problem you've tracked in Smarana, a small bubble appears in the corner. Click to expand and see:
                        </p>
                        <ul className="space-y-3 text-white/70">
                            {[
                                "Your personal notes for this problem",
                                "Your saved solution (reveal when ready)",
                                "Review status and next review date",
                                "Quick link back to Smarana",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-[#BB7331] shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mock overlay preview */}
                    <div className="relative">
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c0c0e] to-[#080809] p-4 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-white/8 pb-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md bg-[#BB7331]/20" />
                                    <span className="font-semibold text-[#BB7331] text-sm">Smarana</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/50">LEETCODE</span>
                                </div>
                                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/40">
                                    <span className="text-xs">×</span>
                                </div>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-1 rounded-full border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">Easy</span>
                                    <span className="text-white/50">Repetition <b className="text-white/80">3</b></span>
                                </div>
                                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-emerald-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    Due in 4 days
                                </div>
                                <div className="rounded-lg border border-white/8 bg-white/[0.03]">
                                    <div className="px-3 py-2 border-b border-white/6 text-[10px] text-white/50 font-medium tracking-wider uppercase">Notes</div>
                                    <div className="px-3 py-2 text-white/70">Use HashMap for O(1) lookup. Two passes: first build map, then find complement.</div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative glow */}
                        <div className="absolute -inset-4 bg-[#BB7331]/5 rounded-3xl blur-2xl -z-10" />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="space-y-8">
                <h2 className="text-2xl font-semibold text-center">
                    Built for focused practice
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {FEATURES.map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
                        >
                            <feature.icon className="h-6 w-6 text-[#BB7331] mb-3" />
                            <h3 className="font-semibold text-white/90 mb-1">{feature.title}</h3>
                            <p className="text-sm text-white/55 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Supported Platforms */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
                <h2 className="text-xl font-semibold mb-6">Supported Platforms</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    {PLATFORMS.map((platform) => (
                        <div
                            key={platform.name}
                            className="px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm"
                        >
                            <div className="font-medium text-white/90">{platform.name}</div>
                            <div className="text-xs text-white/40 mt-0.5">{platform.domain}</div>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-white/40 mt-6">
                    More platforms coming soon based on user requests.
                </p>
            </section>

            {/* How to Install */}
            <section className="space-y-8">
                <h2 className="text-2xl font-semibold text-center">
                    Get started in 3 steps
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {STEPS.map((step) => (
                        <div
                            key={step.step}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
                        >
                            <div className="text-3xl font-mono font-bold text-[#BB7331]/30 mb-3">{step.step}</div>
                            <h3 className="font-semibold text-white/90 mb-2">{step.title}</h3>
                            <p className="text-sm text-white/55 leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="rounded-3xl border border-[#BB7331]/20 bg-gradient-to-b from-[#BB7331]/10 to-transparent p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Ready to enhance your workflow?
                </h2>
                <p className="text-white/60 mb-6 max-w-lg mx-auto">
                    Download the extension and connect it to your Smarana account. Your notes will be right there when you need them.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Button
                        size="lg"
                        className="h-12 px-6 text-base font-medium rounded-full"
                        asChild
                    >
                        <a href="https://chromewebstore.google.com/detail/smarana-companion/mbbhnangobklngdbmbjolbinofdaelnh" target="_blank" rel="noopener noreferrer">
                            Add to Chrome
                        </a>
                    </Button>
                </div>
                <p className="text-xs text-white/40 mt-4">
                    Works with Chrome, Edge, Brave, and other Chromium browsers.
                </p>
            </section>
        </div>
    );
}
