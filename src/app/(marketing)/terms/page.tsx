import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service · Smarana",
    description: "Terms of Service for using Smarana.",
};

export default function TermsPage() {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 md:px-0">
            <header className="mb-8 md:mb-12">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                    Terms of <span className="text-[#BB7331]">Service</span>
                </h1>
                <p className="mt-4 text-white/60 text-lg max-w-2xl leading-relaxed">
                    By using Smarana, you agree to these terms. We keep them simple and fair.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-white/40">
                    <span>Last updated: February 4, 2026</span>
                </div>
            </header>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12 overflow-hidden">
                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white/90 prose-a:text-[#BB7331] prose-a:no-underline hover:prose-a:text-[#BB7331]/80">

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using Smarana ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use the Service.
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        Smarana is a spaced repetition tool designed to help developers remember algorithms and coding problems. It provides scheduling, tracking, and review features. You act as the user of the study material, and we provide the platform to organize it.
                    </p>

                    <h2>3. User Responsibilities</h2>
                    <ul className="list-disc pl-5">
                        <li>You are responsible for maintaining the security of your account credentials.</li>
                        <li>You agree not to use the Service for any illegal or unauthorized purpose.</li>
                        <li>You retain ownership of any personal notes or content you create within the platform.</li>
                    </ul>

                    <h2>4. No Affiliation</h2>
                    <p>
                        Smarana is an independent educational tool. We are <strong>not</strong> affiliated with LeetCode, Codeforces, AtCoder, CodeChef, or any other competitive programming platforms. Any trademarks used are the property of their respective owners and appear for identification purposes only.
                    </p>

                    <h2>5. Disclaimer of Warranties</h2>
                    <p>
                        The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the Service will meet your specific requirements or be uninterrupted, timely, secure, or error-free.
                    </p>

                    <h2>6. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. We will notify users of any significant changes via the Service or email. Your continued use of the Service after such changes constitutes acceptance of the new terms.
                    </p>

                    <h2>7. Contact</h2>
                    <p>
                        If you have any questions about these Terms, please contact us via the <a href="/contact">Contact Page</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
