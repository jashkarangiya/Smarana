import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy for Smarana.",
};

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl space-y-8 text-white/80 leading-relaxed">
            <h1 className="text-3xl font-semibold text-white">Privacy Policy</h1>
            <p className="text-white/50 text-sm">Last updated: January 29, 2026</p>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
                <p>
                    Smarana ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our application.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
                <ul className="list-disc pl-5 space-y-2 text-white/70">
                    <li><strong>Account Information:</strong> When you sign up, we collect your email address and name (via Google OAuth or email registration).</li>
                    <li><strong>Usage Data:</strong> We track the problems you add, your review history, and your difficulty ratings to power the spaced repetition algorithm.</li>
                    <li><strong>Cookies:</strong> We use essential cookies to maintain your session.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">3. How We Use Your Information</h2>
                <p>
                    We use your data solely to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-white/70">
                    <li>Provide and improve the Smarana service.</li>
                    <li>Calculate your optimal review schedule.</li>
                    <li>Communicate with you regarding your account or updates.</li>
                </ul>
                <p>We do <strong>not</strong> sell your data to third parties.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
                <p>
                    We implement reasonable security measures to protect your data. However, no method of transmission over the Internet is 100% secure.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">5. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@smarana.app" className="text-[#BB7331] hover:underline">hello@smarana.app</a>.
                </p>
            </section>
        </div>
    );
}
