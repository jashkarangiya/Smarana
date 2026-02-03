import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms of Service for Smarana.",
};

export default function TermsPage() {
    return (
        <div className="max-w-3xl space-y-8 text-white/80 leading-relaxed">
            <h1 className="text-3xl font-semibold text-white">Terms of Service</h1>
            <p className="text-white/50 text-sm">Last updated: January 29, 2026</p>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                <p>
                    By accessing or using Smarana, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not use our service.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">2. Use License</h2>
                <p>
                    Smarana grants you a personal, non-exclusive, non-transferable license to use the application for your personal study and organization.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">3. Disclaimer</h2>
                <p>
                    The materials on Smarana are provided "as is". We make no warranties, expressed or implied, regarding the reliability or accuracy of the service for any specific purpose.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">4. Limitations</h2>
                <p>
                    In no event shall Smarana or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use Smarana.
                </p>
            </section>
        </div>
    );
}
