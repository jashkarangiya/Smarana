"use client"

import { useState, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Copy,
    Check,
    Loader2,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

type Platform = "leetcode" | "codeforces" | "codechef" | "atcoder"

interface VerifyPlatformModalProps {
    platform: Platform
    currentUsername?: string | null
    isVerified?: boolean
    open: boolean
    onOpenChange: (open: boolean) => void
    onVerified?: () => void
}

const PLATFORM_LABELS: Record<Platform, string> = {
    leetcode: "LeetCode",
    codeforces: "Codeforces",
    codechef: "CodeChef",
    atcoder: "AtCoder"
}

const PLATFORM_URLS: Record<Platform, string> = {
    leetcode: "https://leetcode.com/profile/",
    codeforces: "https://codeforces.com/settings/social",
    codechef: "https://www.codechef.com/users/edit",
    atcoder: "https://atcoder.jp/settings"
}

type Step = "username" | "instructions" | "checking" | "success" | "error"

export function VerifyPlatformModal({
    platform,
    currentUsername,
    isVerified = false,
    open,
    onOpenChange,
    onVerified
}: VerifyPlatformModalProps) {
    const [step, setStep] = useState<Step>(isVerified ? "success" : "username")
    const [username, setUsername] = useState(currentUsername || "")
    const [token, setToken] = useState<string | null>(null)
    const [instructions, setInstructions] = useState<{ field: string; steps: string[] } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleGenerateToken = useCallback(async () => {
        if (!username.trim()) {
            toast.error("Please enter your username")
            return
        }

        setIsLoading(true)
        setErrorMessage(null)

        try {
            const res = await fetch("/api/verify-platform", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform, username: username.trim() })
            })

            const data = await res.json()

            if (!res.ok) {
                setErrorMessage(data.error || "Failed to generate token")
                setStep("error")
                return
            }

            setToken(data.token)
            setInstructions(data.instructions)
            setStep("instructions")
        } catch (error) {
            setErrorMessage("Network error. Please try again.")
            setStep("error")
        } finally {
            setIsLoading(false)
        }
    }, [platform, username])

    const handleCheckVerification = useCallback(async () => {
        setIsLoading(true)
        setStep("checking")
        setErrorMessage(null)

        try {
            const res = await fetch("/api/verify-platform", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform })
            })

            const data = await res.json()

            if (!res.ok) {
                setErrorMessage(data.error || "Verification failed")
                setStep("error")
                return
            }

            if (data.verified) {
                setStep("success")
                onVerified?.()
                toast.success(`${PLATFORM_LABELS[platform]} verified!`)
            } else {
                setErrorMessage(data.message || "Token not found. Make sure you've added it to your profile.")
                setStep("error")
            }
        } catch (error) {
            setErrorMessage("Network error. Please try again.")
            setStep("error")
        } finally {
            setIsLoading(false)
        }
    }, [platform, onVerified])

    const handleCopyToken = useCallback(async () => {
        if (!token) return
        await navigator.clipboard.writeText(token)
        setCopied(true)
        toast.success("Token copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }, [token])

    const handleReset = useCallback(() => {
        setStep("username")
        setToken(null)
        setInstructions(null)
        setErrorMessage(null)
    }, [])

    const renderContent = () => {
        switch (step) {
            case "username":
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Verify {PLATFORM_LABELS[platform]}</DialogTitle>
                            <DialogDescription>
                                Enter your {PLATFORM_LABELS[platform]} username to start verification.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <Input
                                placeholder={`Your ${PLATFORM_LABELS[platform]} username`}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                onKeyDown={(e) => e.key === "Enter" && handleGenerateToken()}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleGenerateToken} disabled={isLoading || !username.trim()}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </Button>
                        </DialogFooter>
                    </>
                )

            case "instructions":
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Add Verification Code</DialogTitle>
                            <DialogDescription>
                                Copy this code and add it to your {PLATFORM_LABELS[platform]} profile.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            {/* Token display */}
                            <div className="flex items-center gap-2">
                                <Input
                                    value={token || ""}
                                    readOnly
                                    className="font-mono text-sm bg-muted"
                                />
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={handleCopyToken}
                                    className="shrink-0"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Instructions */}
                            {instructions && (
                                <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                                    <div className="text-sm font-medium">
                                        Add to your <Badge variant="secondary">{instructions.field}</Badge>:
                                    </div>
                                    <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                                        {instructions.steps.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {/* Quick link */}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.open(PLATFORM_URLS[platform], "_blank")}
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open {PLATFORM_LABELS[platform]} Settings
                            </Button>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleReset}>
                                Back
                            </Button>
                            <Button onClick={handleCheckVerification} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                I&apos;ve Added It
                            </Button>
                        </DialogFooter>
                    </>
                )

            case "checking":
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Checking...</DialogTitle>
                            <DialogDescription>
                                Verifying your {PLATFORM_LABELS[platform]} profile.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-8 flex flex-col items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="mt-4 text-sm text-muted-foreground">
                                Fetching your profile...
                            </p>
                        </div>
                    </>
                )

            case "success":
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Verified!
                            </DialogTitle>
                            <DialogDescription>
                                Your {PLATFORM_LABELS[platform]} account has been verified.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-green-500/10 p-4">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                You can now remove the verification code from your profile.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => onOpenChange(false)}>
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                )

            case "error":
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                Verification Failed
                            </DialogTitle>
                            <DialogDescription>
                                We couldn&apos;t verify your account.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                                <p className="text-sm text-destructive">
                                    {errorMessage}
                                </p>
                            </div>
                            {token && (
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Token: <code className="font-mono bg-muted px-1 rounded">{token}</code>
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleReset}>
                                Start Over
                            </Button>
                            {token && (
                                <Button onClick={handleCheckVerification} disabled={isLoading}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Check Again
                                </Button>
                            )}
                        </DialogFooter>
                    </>
                )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {renderContent()}
            </DialogContent>
        </Dialog>
    )
}
