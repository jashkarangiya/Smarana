"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { status } = useSession()

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/")
        }
    }, [status])

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Wrapper with top padding to account for fixed navbar
    return (
        <main className="pt-20 min-h-screen">
            {children}
        </main>
    )
}
