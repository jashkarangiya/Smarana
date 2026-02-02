"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"

/**
 * This page is displayed after the user successfully connects the extension.
 * The extension's background script listens for navigation to this URL
 * and extracts the code parameter to complete the auth flow.
 */
export default function ExtensionCallbackPage() {
    const searchParams = useSearchParams()
    const code = searchParams.get("code")
    const [countdown, setCountdown] = useState(3)

    useEffect(() => {
        // Countdown timer to close the tab
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    // Try to close the tab
                    window.close()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    if (!code) {
        return (
            <div className="container max-w-md mx-auto py-16">
                <Card className="border-destructive">
                    <CardHeader className="text-center">
                        <CardTitle>Invalid Callback</CardTitle>
                        <CardDescription>
                            Missing authorization code. Please try connecting again from the extension.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-md mx-auto py-16">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <CardTitle>Extension Connected!</CardTitle>
                    <CardDescription>
                        Your Smarana extension is now linked to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                        You can now see your notes and review status on problem pages.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Closing in {countdown}...</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
