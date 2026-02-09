import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy · Smarana",
    description: "How Smarana collects and uses data to power your algorithm review workflow.",
};

export default function PrivacyPage() {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 md:px-0">
            <header className="mb-8 md:mb-12">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                    Privacy <span className="text-[#BB7331]">Policy</span>
                </h1>
                <p className="mt-4 text-white/60 text-lg max-w-2xl leading-relaxed">
                    Transparency is core to Smarana. We only store what's needed to help you master algorithms, and you stay in control.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-white/40">
                    <span>Last updated: February 4, 2026</span>
                </div>
            </header>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12 overflow-hidden">
                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white/90 prose-a:text-[#BB7331] prose-a:no-underline hover:prose-a:text-[#BB7331]/80">

                    <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/5 not-prose mb-10">
                        <h3 className="text-lg font-semibold text-white mb-2">At a glance</h3>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li className="flex gap-2">
                                <span className="text-emerald-500">✓</span>
                                We store your account and study data to schedule reviews.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">✓</span>
                                Your notes and solutions are private by default.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">✓</span>
                                You can toggle profile visibility and hide platform usernames.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">✓</span>
                                We do <strong>not</strong> sell your personal data.
                            </li>
                        </ul>
                    </div>

                    <h2>1. Information We Collect</h2>
                    <p>To provide the Smarana spaced repetition service, we collect the following types of information:</p>
                    <ul>
                        <li><strong>Account Data:</strong> Your name, email address, and profile image (via Google OAuth or email registration). If you register using email/password, we store a secure hash of your password.</li>
                        <li><strong>Profile Data:</strong> Optional bio, timezone setting, and platform usernames (e.g., LeetCode, Codeforces, AtCoder, CodeChef) that you choose to link.</li>
                        <li><strong>Study Data:</strong> The problems you track, your difficulty ratings, review history, XP, and session logs. This is the core data used to calculate your optimal review schedule.</li>
                        <li><strong>User Content:</strong> Any personal notes, pitfalls, or solution text you save for specific problems.</li>
                    </ul>

                    <h2>2. How We Use Your Data</h2>
                    <p>We use your information solely for the purpose of operating and improving the Smarana platform:</p>
                    <ul>
                        <li><strong>Algorithm Scheduling:</strong> Determining when you should review a problem based on your past performance (SM-2 algorithm).</li>
                        <li><strong>Progress Tracking:</strong> Generating insights on your dashboard, such as streaks, heatmaps, and review counts.</li>
                        <li><strong>Social Features:</strong> Enabling friend connections and leaderboards, but only if you opt-in to public visibility.</li>
                        <li><strong>Communication:</strong> Sending essential service emails (e.g., password resets) or updates about your account.</li>
                    </ul>

                    <h2>3. Data Visibility & Control</h2>
                    <p>You have granular control over what is visible to others:</p>
                    <ul>
                        <li><strong>Profile Privacy:</strong> You can set your profile to Public, Friends Only, or Private.</li>
                        <li><strong>Platform Handles:</strong> You can choose whether to display your linked coding platform usernames publicly.</li>
                        <li><strong>Notes & Solutions:</strong> Your personal study notes are private to you unless you explicitly choose to share them (feature coming soon).</li>
                    </ul>

                    <h2>4. Cookies & Local Storage</h2>
                    <p>We use essential cookies and local storage tokens for authentication (keeping you logged in) and maintaining your session security. We do not use third-party tracking cookies for advertising.</p>

                    <h2>5. Third-Party Platforms</h2>
                    <p>Smarana is an independent tool designed to help you study. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with LeetCode, Codeforces, AtCoder, CodeChef, or any of their subsidiaries or affiliates.</p>

                    <h2>6. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or wish to request data deletion, please contact us via the <Link href="/contact">Contact Page</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
