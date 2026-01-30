import type { ReactNode } from "react";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Top nav */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2">
                        {/* logo mark here */}
                        <span className="text-lg font-semibold tracking-tight">
                            Smarana <span className="text-white/50">(स्मरण)</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link href="/sign-in" className="text-sm text-white/70 hover:text-white transition-colors">
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-xl bg-[#BB7331] px-4 py-2 text-sm font-medium text-black hover:bg-[#BB7331]/90 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-12">{children}</main>

            {/* Footer */}
            <footer className="mt-16 border-t border-white/5">
                <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
                    <div className="space-y-2">
                        <div className="text-sm font-semibold">Smarana</div>
                        <p className="text-sm text-white/55">
                            Remember patterns. Build lasting problem-solving skill.
                        </p>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="font-semibold">Product</div>
                        <ul className="space-y-1 text-white/60">
                            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                            <li><Link href="/team" className="hover:text-white transition-colors">Team</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="font-semibold">Legal</div>
                        <ul className="space-y-1 text-white/60">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                            <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                        </ul>

                        {/* Author Credits */}
                        <div className="pt-3 text-white/50">
                            Built by <span className="text-white/70 font-medium">JK</span>
                            <span className="px-2">•</span>
                            <a className="hover:text-white transition-colors" href="https://github.com/jashkarangiya" target="_blank">GitHub</a>
                            <span className="px-2">•</span>
                            <a className="hover:text-white transition-colors" href="https://linkedin.com/in/jashkarangiya" target="_blank">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
