import { Metadata } from "next";
import Link from "next/link";
import { Mail, Github, Linkedin } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact • Smarana",
    description: "Get in touch with the Smarana team.",
};

export default function ContactPage() {
    return (
        <div className="space-y-12 max-w-2xl">
            <section>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Contact <span className="text-[#BB7331]">Us</span>
                </h1>
                <p className="mt-4 text-white/65 leading-relaxed">
                    Have questions, feedback, or just want to say hello?
                    We're a small team (just JK and the virtual interns), but we read every message.
                </p>
            </section>

            <section className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-white/70" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Email Support</h3>
                            <a href="mailto:hello@smarana.app" className="text-sm text-[#BB7331] hover:underline">hello@smarana.app</a>
                        </div>
                    </div>
                    <p className="text-xs text-white/40 pl-14">Response time: Usually within 24-48 hours.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <h3 className="font-semibold mb-4">Connect on Social</h3>
                    <div className="flex gap-4">
                        <a href="https://github.com/jashkarangiya" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                            <Github className="h-4 w-4" />
                            GitHub
                        </a>
                        <a href="https://linkedin.com/in/jashkarangiya" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
