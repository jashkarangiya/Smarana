import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookie Policy",
    description: "How Smarana uses cookies for essential functionality.",
};

export default function CookiesPage() {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 md:px-0">
            <header className="mb-8 md:mb-12">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                    Cookie <span className="text-[#BB7331]">Policy</span>
                </h1>
                <p className="mt-4 text-white/60 text-lg max-w-2xl leading-relaxed">
                    We keep it minimal. We use cookies only for what's necessary to make the app work.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-white/40">
                    <span>Last updated: February 4, 2026</span>
                </div>
            </header>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12 overflow-hidden">
                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white/90 prose-a:text-[#BB7331] prose-a:no-underline hover:prose-a:text-[#BB7331]/80">

                    <h2>What are cookies?</h2>
                    <p>
                        Cookies are small text files stored on your device when you visit a website. They help the website remember who you are and your preferences.
                    </p>

                    <h2>How we use cookies</h2>
                    <p>
                        Smarana uses cookies strictly for <strong>essential functionality</strong>:
                    </p>
                    <ul>
                        <li><strong>Authentication:</strong> To keep you logged in as you navigate between pages. Without these, you would need to log in on every single page load.</li>
                        <li><strong>Security:</strong> To protect your account and preventing cross-site request forgery (CSRF) attacks.</li>
                    </ul>

                    <h2>Tracking & Advertising</h2>
                    <p>
                        We do <strong>not</strong> use third-party tracking cookies for behavioral advertising. We respect your privacy and do not sell your browsing habits.
                    </p>

                    <h2>Managing Cookies</h2>
                    <p>
                        Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may be unable to sign in to Smarana.
                    </p>
                </div>
            </div>
        </div>
    );
}
