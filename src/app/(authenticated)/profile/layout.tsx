"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SettingsNav } from "@/components/layout/settings-nav"
import { ArrowLeft, Copy, User } from "lucide-react"

const PAGE_DETAILS: Record<string, { title: string; subtitle: string }> = {
    "/profile": {
        title: "Basic Info",
        subtitle: "Update your photo, name, and profile basics.",
    },
    "/profile/platforms": {
        title: "Platforms",
        subtitle: "Manage your external coding platform integrations.",
    },
    "/profile/visibility": {
        title: "Visibility",
        subtitle: "Control who can see your profile and activity.",
    },
    "/profile/accounts": {
        title: "Accounts",
        subtitle: "Manage your account security and data.",
    },
}

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const details = PAGE_DETAILS[pathname] || { title: "Settings", subtitle: "Manage your preferences" }

    return (
        <div className="mx-auto w-full max-w-6xl px-6 py-8">

            <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">

                {/* Header spans both columns */}
                <header className="lg:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-2">
                    <div className="space-y-3">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm text-[#BB7331]/90 hover:text-[#BB7331] transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>

                        <div>
                            <h1 className="text-2xl font-semibold text-white/90">{details.title}</h1>
                            <p className="text-sm text-white/55">
                                {details.subtitle}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" className="gap-2">
                            <Copy className="h-3.5 w-3.5" />
                            Copy Link
                        </Button>
                        <Button size="sm" className="bg-[#BB7331] text-black hover:bg-[#BB7331]/90 gap-2">
                            <User className="h-3.5 w-3.5" />
                            View Public Profile
                        </Button>
                    </div>
                </header>

                {/* Left nav */}
                <aside className="lg:sticky lg:top-24 self-start">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                        <SettingsNav />
                    </div>
                </aside>

                {/* Mobile Nav (visible only on small screens) */}
                <div className="lg:hidden">
                    <SettingsNav />
                </div>

                {/* Main Content */}
                <main className="min-w-0 lg:border-l lg:border-white/5 lg:pl-10">
                    <div className="max-w-3xl space-y-6">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    )
}
