import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookies Policy",
    description: "Cookies Policy for Smarana.",
};

export default function CookiesPage() {
    return (
        <div className="max-w-3xl space-y-8 text-white/80 leading-relaxed">
            <h1 className="text-3xl font-semibold text-white">Cookie Policy</h1>
            <p className="text-white/50 text-sm">Last updated: January 29, 2026</p>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">What are cookies?</h2>
                <p>
                    Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to remember your actions and preferences over a period of time.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">How we use cookies</h2>
                <p>
                    Smarana uses cookies primarily for <strong>authentication and security</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-white/70">
                    <li><strong>Essential Cookies:</strong> These are necessary for the website to function (e.g., keeping you logged in).</li>
                    <li><strong>Preference Cookies:</strong> We may use these to remember your settings (like dark mode, though our site is always dark mode!).</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Managing Cookies</h2>
                <p>
                    You can control and/or delete cookies as you wish using your browser settings. However, disabling cookies may limit your ability to use Smarana (specifically, you won't be able to log in).
                </p>
            </section>
        </div>
    );
}
