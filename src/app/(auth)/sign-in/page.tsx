"use client"

import { signIn } from "next-auth/react"
import { useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/layout/logo"
import { toast } from "sonner"
import Link from "next/link"
import { Brain, BarChart3, Trophy, Zap, Target, Flame, TrendingUp, Clock, Sparkles, Check, X, Loader2, Info } from "lucide-react"
import { PasswordStrength } from "@/components/shared/password-strength"
import { z } from "zod"
import { useDebounce } from "use-debounce"
import { validatePassword } from "@/lib/auth/passwordPolicy"


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

const usernameRegex = /^[a-z0-9_]{3,20}$/

const SignUpSchema = z.object({
    name: z.string().min(1, "Name is required").max(80),
    email: z.string().email("Invalid email address"),
    username: z.string()
        .min(3, "Username must be at least 3 chars")
        .max(20, "Username must be at most 20 chars")
        .regex(usernameRegex, "Only lowercase letters, numbers, and underscores"),
    password: z.string(),
    confirmPassword: z.string()
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
}).refine((d) => {
    return validatePassword(d.password).ok
}, {
    message: "Password does not meet requirements",
    path: ["password"]
})

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

    // Register specific state
    const [formData, setFormData] = useState({ name: "", email: "", username: "", password: "", confirmPassword: "" })
    const [debouncedUsername] = useDebounce(formData.username, 500)
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (error) {
            toast.error(error === "CredentialsSignin" ? "Invalid credentials" : "Something went wrong")
        }
    }, [error])

    // Username check effect
    useEffect(() => {
        const checkUsername = async () => {
            if (!debouncedUsername || debouncedUsername.length < 3) {
                setUsernameAvailable(null)
                return
            }
            if (!usernameRegex.test(debouncedUsername)) {
                setUsernameAvailable(false) // Invalid format
                return
            }

            setCheckingUsername(true)
            try {
                const res = await fetch(`/api/register/check-username?username=${debouncedUsername}`)
                const data = await res.json()
                setUsernameAvailable(data.available)
            } catch {
                setUsernameAvailable(null)
            } finally {
                setCheckingUsername(false)
            }
        }

        if (mode === "register") {
            checkUsername()
        }
    }, [debouncedUsername, mode])

    const handleModeChange = (newMode: "signin" | "register") => {
        setMode(newMode)
        window.history.replaceState(null, "", newMode === "register" ? "/register" : "/sign-in")
        setValidationErrors({})
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

        // Validate with Zod
        const result = SignUpSchema.safeParse(formData)
        if (!result.success) {
            const errors: Record<string, string> = {}
            result.error.issues.forEach(err => {
                if (err.path[0]) errors[err.path[0].toString()] = err.message
            })
            setValidationErrors(errors)
            return
        }

        if (usernameAvailable === false) {
            toast.error("Username is already taken")
            return
        }

        setRegistering(true)
        setValidationErrors({})

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            if (!res.ok) throw new Error(await res.text())
            toast.success("Account created!")

            // Auto sign in after register? Or just switch to sign in
            // Typically auto-sign in is better UX but requires creds. 
            // For now, switch to sign in mode and pre-fill email
            setIdentifier(formData.email)
            setPassword("") // Don't pre-fill password for security
            handleModeChange("signin")

        } catch (err: any) {
            toast.error(err.message || "Something went wrong")
        } finally {
            setRegistering(false)
        }
    }

    const isSignIn = mode === "signin"
    const features = isSignIn ? SIGNIN_FEATURES : SIGNUP_FEATURES

    return (
        <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto bg-background">
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
                    <div className="hidden lg:flex w-1/2 bg-[#BB7331] text-white p-12 items-center justify-center relative overflow-hidden">
                        {/* Decorative Layers */}
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                            {/* Big ring behind headline */}
                            <div className="absolute left-12 top-24 h-[340px] w-[340px] rounded-full border border-white/10" />

                            {/* Orbit arc bottom right */}
                            <div className="absolute right-[-60px] bottom-[-20px] h-[380px] w-[380px] rounded-full border border-white/5 [mask-image:linear-gradient(transparent,black_60%)]" />

                            {/* Floating soft glow orb */}
                            <div className="absolute -left-24 top-40 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl animate-smarana-float" />

                            {/* Spark dots */}
                            <div className="absolute left-20 top-[60%] h-1 w-1 rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            <div className="absolute left-32 top-[65%] h-0.5 w-0.5 rounded-full bg-white/30" />
                        </div>

                        <div className="relative z-10 max-w-sm">
                            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">Welcome Back!</h2>
                            <p className="text-lg text-white/90 mb-10 leading-relaxed">Your algorithms are waiting. Pick up right where you left off.</p>
                            <div className="space-y-5">
                                {SIGNIN_FEATURES.map((f, i) => (
                                    <div key={i} className="flex gap-3 group">
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                                            <f.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{f.title}</h3>
                                            <p className="text-sm text-white/70">{f.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex items-center gap-3 text-sm text-white/60">
                                <Sparkles className="h-4 w-4" /><span>Resume instantly</span>
                                <span className="w-1 h-1 rounded-full bg-white/40" />
                                <Flame className="h-4 w-4" /><span>Keep your streak</span>
                            </div>
                        </div>
                    </div>

                    {/* Sign In Form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
                        {/* Seam Glow */}
                        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />
                        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[100px] bg-gradient-to-r from-[#BB7331]/15 to-transparent blur-2xl hidden lg:block" />

                        {/* Black Panel Decorations */}
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                            {/* Warm glow behind header */}
                            <div className="absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 bg-[#BB7331]/5 blur-3xl rounded-full opacity-60" />

                            {/* Faint corner rings */}
                            <div className="absolute -right-20 top-[-50px] h-[300px] w-[300px] rounded-full border border-white/5" />
                            <div className="absolute -left-20 bottom-[-50px] h-[300px] w-[300px] rounded-full border border-white/5" />

                            {/* Subtle Grid Texture */}
                            <div
                                className="absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
                                style={{
                                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                                    backgroundSize: '40px 40px'
                                }}
                            />

                            {/* Random Glow Orbs (Sign In) */}
                            <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-[#BB7331]/5 rounded-full blur-2xl opacity-60 pointer-events-none" />
                            <div className="absolute bottom-[15%] left-[5%] w-24 h-24 bg-[#BB7331]/5 rounded-full blur-2xl opacity-60 pointer-events-none" />
                        </div>

                        <div className="w-full max-w-sm relative z-10">
                            <div className="text-center mb-4 sm:mb-6">
                                <div className="relative flex justify-center mb-6">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#BB7331]/20 rounded-full blur-xl pointer-events-none" />
                                    <Link href="/" className="relative"><Logo size="lg" /></Link>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold">Sign in</h1>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                    New to Smarana?{" "}
                                    <button onClick={() => handleModeChange("register")} className="text-primary hover:underline font-medium">
                                        Create an account
                                    </button>
                                </p>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                <Button type="button" variant="outline" className="w-full h-10 sm:h-11 text-sm" onClick={handleGoogleSignIn}>
                                    <GoogleIcon />Continue with Google
                                </Button>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">or</span>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleCredentialsSignIn} className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="signin-id" className="text-sm">Email or Username</Label>
                                    <Input id="signin-id" placeholder="you@example.com" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-10 sm:h-11" />
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Button asChild variant="link" className="px-0 font-normal h-auto float-right text-xs">
                                        <Link href="/forgot-password">Forgot password?</Link>
                                    </Button>
                                    <Label htmlFor="signin-pw" className="text-sm">Password</Label>
                                    <PasswordInput id="signin-pw" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 sm:h-11" />
                                </div>
                                <Button type="submit" className="w-full h-10 sm:h-11" disabled={signingIn}>
                                    {signingIn ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Register Layout: Form Left, Orange Right */}
                <div className="flex min-h-screen" style={{ width: "100vw" }}>
                    {/* Register Form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
                        {/* Seam Glow (Right side for Register view) */}
                        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />
                        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[100px] bg-gradient-to-l from-[#BB7331]/15 to-transparent blur-2xl hidden lg:block" />

                        {/* Black Panel Decorations */}
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                            {/* Warm glow behind header */}
                            <div className="absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 bg-[#BB7331]/5 blur-3xl rounded-full opacity-60" />

                            {/* Faint corner rings */}
                            <div className="absolute -left-20 top-[-50px] h-[300px] w-[300px] rounded-full border border-white/5" />
                            <div className="absolute -right-20 bottom-[-50px] h-[300px] w-[300px] rounded-full border border-white/5" />

                            {/* Subtle Grid Texture */}
                            <div
                                className="absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
                                style={{
                                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                                    backgroundSize: '40px 40px'
                                }}
                            />

                            {/* Random Glow Orbs (Register) */}
                            <div className="absolute top-[15%] left-[10%] w-32 h-32 bg-[#BB7331]/5 rounded-full blur-2xl opacity-60 pointer-events-none" />
                            <div className="absolute bottom-[20%] right-[5%] w-24 h-24 bg-[#BB7331]/5 rounded-full blur-2xl opacity-60 pointer-events-none" />
                        </div>

                        <div className="w-full max-w-sm relative z-10">
                            <div className="text-center mb-4 sm:mb-6">
                                <div className="relative flex justify-center mb-6">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#BB7331]/20 rounded-full blur-xl pointer-events-none" />
                                    <Link href="/" className="relative"><Logo size="lg" /></Link>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold">Create an account</h1>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                    Already have an account?{" "}
                                    <button onClick={() => handleModeChange("signin")} className="text-primary hover:underline font-medium">
                                        Sign in
                                    </button>
                                </p>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                <Button type="button" variant="outline" className="w-full h-10 sm:h-11 text-sm" onClick={handleGoogleSignIn}>
                                    <GoogleIcon />Continue with Google
                                </Button>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">or</span>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleRegister} className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="reg-name" className="text-sm">Name</Label>
                                    <Input
                                        id="reg-name"
                                        placeholder="Your name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        className="h-10 sm:h-11"
                                    />
                                    {validationErrors.name && <p className="text-destructive text-xs">{validationErrors.name}</p>}
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="reg-username" className="text-sm">Username</Label>
                                    <div className="relative">
                                        <Input
                                            id="reg-username"
                                            placeholder="username (lowercase)"
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                                            className={`h-10 sm:h-11 ${usernameAvailable === false ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {checkingUsername ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            ) : formData.username.length >= 3 && (
                                                usernameAvailable === true ? (
                                                    <Check className="h-4 w-4 text-emerald-500" />
                                                ) : usernameAvailable === false ? (
                                                    <X className="h-4 w-4 text-destructive" />
                                                ) : null
                                            )}
                                        </div>
                                    </div>
                                    {validationErrors.username ? (
                                        <p className="text-destructive text-xs">{validationErrors.username}</p>
                                    ) : usernameAvailable === false ? (
                                        <p className="text-destructive text-xs">Username is taken</p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Unique identifier, only letters, numbers, _</p>
                                    )}
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="reg-email" className="text-sm">Email</Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                        className="h-10 sm:h-11"
                                    />
                                    {validationErrors.email && <p className="text-destructive text-xs">{validationErrors.email}</p>}
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="reg-pw" className="text-sm">Password</Label>
                                    <PasswordInput
                                        id="reg-pw"
                                        placeholder="At least 8 characters"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                                        className="h-10 sm:h-11"
                                    />
                                    {formData.password && <PasswordStrength password={formData.password} />}
                                    {validationErrors.password && <p className="text-destructive text-xs">{validationErrors.password}</p>}
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label htmlFor="reg-confirm-pw" className="text-sm">Confirm Password</Label>
                                    <PasswordInput
                                        id="reg-confirm-pw"
                                        placeholder="Confirm password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                                        className="h-10 sm:h-11"
                                    />
                                    {validationErrors.confirmPassword && <p className="text-destructive text-xs">{validationErrors.confirmPassword}</p>}
                                </div>

                                <Button type="submit" className="w-full h-10 sm:h-11" disabled={registering || usernameAvailable === false}>
                                    {registering ? "Creating account..." : "Create Account"}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    By signing up, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy</Link>
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Orange Panel - Register */}
                    <div className="hidden lg:flex w-1/2 bg-[#BB7331] text-white p-12 items-center justify-center relative overflow-hidden">
                        {/* Decorative Layers */}
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                            {/* Big ring behind headline (mirrored for right side) */}
                            <div className="absolute right-12 top-24 h-[340px] w-[340px] rounded-full border border-white/10" />

                            {/* Orbit arc bottom left */}
                            <div className="absolute left-[-60px] bottom-[-20px] h-[380px] w-[380px] rounded-full border border-white/5 [mask-image:linear-gradient(transparent,black_60%)]" />

                            {/* Floating soft glow orb */}
                            <div className="absolute -right-24 top-40 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl animate-smarana-float" />

                            {/* Spark dots */}
                            <div className="absolute right-20 top-[60%] h-1 w-1 rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            <div className="absolute right-32 top-[65%] h-0.5 w-0.5 rounded-full bg-white/30" />
                        </div>

                        <div className="relative z-10 max-w-sm">
                            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">Welcome to Smarana</h2>
                            <p className="text-lg text-white/90 mb-10 leading-relaxed">Master algorithms through spaced repetition and never forget.</p>
                            <div className="space-y-5">
                                {SIGNUP_FEATURES.map((f, i) => (
                                    <div key={i} className="flex gap-3 group">
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                                            <f.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{f.title}</h3>
                                            <p className="text-sm text-white/70">{f.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex items-center gap-3 text-sm text-white/60">
                                <Zap className="h-4 w-4" /><span>Free forever</span>
                                <span className="w-1 h-1 rounded-full bg-white/40" />
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
