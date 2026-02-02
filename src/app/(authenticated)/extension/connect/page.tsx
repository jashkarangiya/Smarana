"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Chrome, Loader2, ShieldCheck, XCircle } from "lucide-react"

export default function ExtensionConnectPage() {
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const state = searchParams.get("state")

    const [status, setStatus] = useState<"idle" | "connecting" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState<string>("")

    // Validate state parameter
    useEffect(() => {
        if (!state) {
            setStatus("error")
            setErrorMessage("Invalid connection request. Please try again from the extension.")
        }
    }, [state])

    const handleConnect = async () => {
        if (!state) return

        setStatus("connecting")

        try {
            const response = await fetch("/api/extension/auth/code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ state }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to create authorization code")
            }

            const { code } = await response.json()

            // Redirect to the callback page
            // The extension's background script listens for navigation to this URL
            // and extracts the code to complete the auth flow
            setStatus("success")

            // Small delay to show success state before redirect
            setTimeout(() => {
                // Redirect to the callback page - the extension will intercept this
                window.location.href = `/extension/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
            }, 1000)
        } catch (err) {
            setStatus("error")
            setErrorMessage(err instanceof Error ? err.message : "Connection failed")
        }
    }

    if (status === "error" && !state) {
        return (
            <div className="container max-w-md mx-auto py-16">
                <Card className="border-destructive">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <XCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <CardTitle>Invalid Request</CardTitle>
                        <CardDescription>
                            This page should be opened from the Smarana browser extension.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                            Please open the extension popup and click &quot;Connect&quot; to link your account.
                        </p>
                        <Button variant="outline" onClick={() => window.close()}>
                            Close this page
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-md mx-auto py-16">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Chrome className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Connect Smarana Extension</CardTitle>
                    <CardDescription>
                        Link your browser extension to access your problems on LeetCode, Codeforces, and more.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === "idle" && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-muted p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm">Secure Connection</p>
                                        <p className="text-xs text-muted-foreground">
                                            The extension will securely connect to your account: {session?.user?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                <p className="mb-2">The extension will be able to:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>View your saved problems and notes</li>
                                    <li>Show review reminders on problem pages</li>
                                    <li>Link to your Smarana dashboard</li>
                                </ul>
                            </div>

                            <Button onClick={handleConnect} className="w-full" size="lg">
                                Connect Extension
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                You can disconnect the extension anytime from your profile settings.
                            </p>
                        </div>
                    )}

                    {status === "connecting" && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Connecting extension...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Connected successfully!</p>
                                <p className="text-sm text-muted-foreground">
                                    Redirecting to extension...
                                </p>
                            </div>
                        </div>
                    )}

                    {status === "error" && state && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <XCircle className="h-6 w-6 text-destructive" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-destructive">Connection Failed</p>
                                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                            </div>
                            <Button onClick={handleConnect} variant="outline">
                                Try Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
