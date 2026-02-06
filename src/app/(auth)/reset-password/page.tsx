"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Check, X, Eye, EyeOff, Shield } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getPasswordRules, validatePassword } from "@/lib/auth/passwordPolicy"

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [tokenValid, setTokenValid] = useState<boolean | null>(null)

    useEffect(() => {
        if (!token) {
            setTokenValid(false)
            return
        }

        // Verify token on mount
        fetch(`/api/auth/reset-password/verify?token=${token}`)
            .then(res => res.json())
            .then(data => setTokenValid(data.valid))
            .catch(() => setTokenValid(false))
    }, [token])

    const passwordRules = getPasswordRules()

    const { ok: allRulesMet } = validatePassword(password)
    const passwordsMatch = password === confirmPassword && confirmPassword !== ""

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!allRulesMet) {
            toast.error("Password does not meet all requirements")
            return
        }

        if (!passwordsMatch) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to reset password")
            }

            toast.success("Password reset successfully!")
            router.push("/sign-in?reset=success")
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password")
        } finally {
            setIsLoading(false)
        }
    }

    if (tokenValid === null) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">Verifying reset link...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!token || tokenValid === false) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
                <Card className="w-full max-w-md border-destructive/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                            <X className="h-6 w-6 text-destructive" />
                        </div>
                        <CardTitle>Invalid Reset Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild className="w-full">
                            <Link href="/forgot-password">Request New Link</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/sign-in">Back to Sign In</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Reset Your Password</CardTitle>
                    <CardDescription>
                        Choose a strong password to secure your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {password && (
                            <div className="space-y-2 p-3 rounded-lg bg-secondary/50">
                                <p className="text-sm font-medium">Password Requirements:</p>
                                {passwordRules.map((rule, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        {rule.test(password) ? (
                                            <Check className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <X className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className={cn(
                                            rule.test(password) ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                                        )}>
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {confirmPassword && (
                                <p className={cn(
                                    "text-sm flex items-center gap-1",
                                    passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                                )}>
                                    {passwordsMatch ? (
                                        <><Check className="h-3 w-3" /> Passwords match</>
                                    ) : (
                                        <><X className="h-3 w-3" /> Passwords do not match</>
                                    )}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !allRulesMet || !passwordsMatch}
                        >
                            {isLoading ? "Resetting Password..." : "Reset Password"}
                        </Button>

                        <Button asChild variant="ghost" className="w-full">
                            <Link href="/sign-in">Back to Sign In</Link>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
