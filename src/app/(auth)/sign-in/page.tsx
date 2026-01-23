"use client"

import { signIn } from "next-auth/react"
import { useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { toast } from "sonner"
import Link from "next/link"
import { Brain, BarChart3, Trophy, Zap, Target, Flame, TrendingUp, Clock, Sparkles } from "lucide-react"

// Sign Up Features
const SIGNUP_FEATURES = [
    { icon: Brain, title: "Spaced Repetition", description: "Scientific method to retain algorithms in long-term memory" },
    { icon: BarChart3, title: "Multi-Platform Sync", description: "Connect LeetCode, Codeforces, AtCoder, and more" },
    { icon: Trophy, title: "Gamified Learning", description: "Earn XP, level up, and track your progress" },
]

// Sign In Features
const SIGNIN_FEATURES = [
    { icon: Clock, title: "Reviews Awaiting", description: "Your scheduled problems are ready for review" },
    { icon: TrendingUp, title: "Continue Your Streak", description: "Keep the momentum going" },
    { icon: Flame, title: "Daily Challenge", description: "Today's challenge is unlocked" },
]

const GoogleIcon = () => (
    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
)

function AuthPageContent() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
    const error = searchParams.get("error")

    const [mode, setMode] = useState<"signin" | "register">(pathname.includes("register") ? "register" : "signin")

    // Form states
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [signingIn, setSigningIn] = useState(false)
    const [registering, setRegistering] = useState(false)
    const [formData, setFormData] = useState({ name: "", email: "", password: "" })

    useEffect(() => {
        if (error) {
            toast.error(error === "CredentialsSignin" ? "Invalid credentials" : "Something went wrong")
        }
    }, [error])

    const handleModeChange = (newMode: "signin" | "register") => {
        setMode(newMode)
        window.history.replaceState(null, "", newMode === "register" ? "/register" : "/sign-in")
    }

    const handleGoogleSignIn = () => signIn("google", { callbackUrl })

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setSigningIn(true)
        try {
            await signIn("credentials", { identifier, password, callbackUrl })
        } catch { toast.error("Sign in failed") }
        finally { setSigningIn(false) }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setRegistering(true)
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            if (!res.ok) throw new Error(await res.text())
            toast.success("Account created!")
            handleModeChange("signin")
        } catch (err: any) { toast.error(err.message || "Something went wrong") }
        finally { setRegistering(false) }
    }

    const isSignIn = mode === "signin"
    const features = isSignIn ? SIGNIN_FEATURES : SIGNUP_FEATURES

    return (
        <div className="min-h-screen w-full overflow-hidden bg-background">
            {/* Container that slides - width is 200vw */}
            <div
                className="flex min-h-screen transition-transform duration-500 ease-in-out"
                style={{
                    width: "200vw",
                    transform: isSignIn ? "translateX(0)" : "translateX(-100vw)"
                }}
            >
                {/* Sign In Layout: Orange Left, Form Right */}
                <div className="flex min-h-screen" style={{ width: "100vw" }}>
                    {/* Orange Panel - Sign In */}
                    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground p-12 items-center justify-center relative overflow-hidden">
                        <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-primary-foreground/10" />
                        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full border border-primary-foreground/10" />
                        <div className="relative z-10 max-w-sm">
                            <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
                            <p className="text-primary-foreground/80 mb-8">Your algorithms are waiting. Pick up right where you left off.</p>
                            <div className="space-y-5">
                                {SIGNIN_FEATURES.map((f, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                                            <f.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{f.title}</h3>
                                            <p className="text-sm text-primary-foreground/70">{f.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex items-center gap-3 text-sm text-primary-foreground/60">
                                <Sparkles className="h-4 w-4" /><span>Resume instantly</span>
                                <span className="w-1 h-1 rounded-full bg-primary-foreground/40" />
                                <Flame className="h-4 w-4" /><span>Keep your streak</span>
                            </div>
                        </div>
                    </div>

                    {/* Sign In Form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                        <div className="w-full max-w-sm">
                            <div className="text-center mb-6">
                                <div className="flex justify-center mb-4"><Logo size="lg" /></div>
                                <h1 className="text-2xl font-bold">Sign in</h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    New to AlgoRecall?{" "}
                                    <button onClick={() => handleModeChange("register")} className="text-primary hover:underline font-medium">
                                        Create an account
                                    </button>
                                </p>
                            </div>
                            <div className="space-y-4">
                                <Button type="button" variant="outline" className="w-full h-11" onClick={handleGoogleSignIn}>
                                    <GoogleIcon />Continue with Google
                                </Button>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">or</span>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleCredentialsSignIn} className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signin-id">Email or Username</Label>
                                    <Input id="signin-id" placeholder="you@example.com" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signin-pw">Password</Label>
                                    <Input id="signin-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
                                </div>
                                <Button type="submit" className="w-full h-11" disabled={signingIn}>
                                    {signingIn ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Register Layout: Form Left, Orange Right */}
                <div className="flex min-h-screen" style={{ width: "100vw" }}>
                    {/* Register Form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                        <div className="w-full max-w-sm">
                            <div className="text-center mb-6">
                                <div className="flex justify-center mb-4"><Logo size="lg" /></div>
                                <h1 className="text-2xl font-bold">Create an account</h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Already have an account?{" "}
                                    <button onClick={() => handleModeChange("signin")} className="text-primary hover:underline font-medium">
                                        Sign in
                                    </button>
                                </p>
                            </div>
                            <div className="space-y-4">
                                <Button type="button" variant="outline" className="w-full h-11" onClick={handleGoogleSignIn}>
                                    <GoogleIcon />Continue with Google
                                </Button>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">or</span>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleRegister} className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-name">Name</Label>
                                    <Input id="reg-name" placeholder="Your name" required value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-email">Email</Label>
                                    <Input id="reg-email" type="email" placeholder="you@example.com" required value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-pw">Password</Label>
                                    <Input id="reg-pw" type="password" placeholder="Min 6 characters" required value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} className="h-11" />
                                </div>
                                <Button type="submit" className="w-full h-11" disabled={registering}>
                                    {registering ? "Creating..." : "Create Account"}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    By signing up, you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy</Link>
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Orange Panel - Register */}
                    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground p-12 items-center justify-center relative overflow-hidden">
                        <div className="absolute top-20 right-20 w-64 h-64 rounded-full border border-primary-foreground/10" />
                        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full border border-primary-foreground/10" />
                        <div className="relative z-10 max-w-sm">
                            <h2 className="text-3xl font-bold mb-2">Welcome to AlgoRecall</h2>
                            <p className="text-primary-foreground/80 mb-8">Master algorithms through spaced repetition and never forget.</p>
                            <div className="space-y-5">
                                {SIGNUP_FEATURES.map((f, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                                            <f.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{f.title}</h3>
                                            <p className="text-sm text-primary-foreground/70">{f.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex items-center gap-3 text-sm text-primary-foreground/60">
                                <Zap className="h-4 w-4" /><span>Free forever</span>
                                <span className="w-1 h-1 rounded-full bg-primary-foreground/40" />
                                <Target className="h-4 w-4" /><span>8+ platforms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Logo size="lg" /></div>}>
            <AuthPageContent />
        </Suspense>
    )
}
