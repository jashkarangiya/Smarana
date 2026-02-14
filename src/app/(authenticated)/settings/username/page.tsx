"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function UsernamePage() {
    const { update } = useSession()
    const [username, setUsername] = useState("")
    const [originalUsername, setOriginalUsername] = useState("")
    const [usernameInfo, setUsernameInfo] = useState<{ canChange: boolean; daysUntilChange: number } | null>(null)
    const [saving, setSaving] = useState(false)
    const [checking, setChecking] = useState(false)
    const [available, setAvailable] = useState<boolean | null>(null)

    useEffect(() => {
        const fetchUsernameInfo = async () => {
            try {
                const res = await fetch("/api/profile/username")
                if (res.ok) {
                    const data = await res.json()
                    setUsername(data.username || "")
                    setOriginalUsername(data.username || "")
                    setUsernameInfo({ canChange: data.canChange, daysUntilChange: data.daysUntilChange })
                }
            } catch (e) {
                console.error("Failed to fetch username", e)
            }
        }
        fetchUsernameInfo()
    }, [])

    // Check username availability
    useEffect(() => {
        if (!username || username === originalUsername || username.length < 3) {
            setAvailable(null)
            return
        }

        const timer = setTimeout(async () => {
            setChecking(true)
            try {
                const res = await fetch(`/api/register/check-username?username=${encodeURIComponent(username)}`)
                const data = await res.json()
                setAvailable(data.available)
            } catch {
                setAvailable(null)
            } finally {
                setChecking(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [username, originalUsername])

    const handleSave = async () => {
        if (!username.trim()) {
            toast.error("Please enter a username")
            return
        }
        if (username.length < 3 || username.length > 20) {
            toast.error("Username must be 3-20 characters")
            return
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            toast.error("Username can only contain letters, numbers, and underscores")
            return
        }
        if (username === originalUsername) {
            toast.error("Username is the same as current")
            return
        }

        setSaving(true)
        try {
            const res = await fetch("/api/profile/username", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Username updated!")
                await update({ username })
                setOriginalUsername(username)
                setUsernameInfo({ canChange: false, daysUntilChange: 90 })
            } else {
                toast.error(data.error || "Failed to update username")
            }
        } catch {
            toast.error("Failed to update username")
        } finally {
            setSaving(false)
        }
    }

    const isValid = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)
    const hasChanged = username !== originalUsername

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-2xl">
            {/* Back Link */}
            <Link
                href="/settings"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
            </Link>

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white/90">Change Username</h1>
                    <p className="text-sm text-white/50 mt-1">
                        Your username is used for your public profile URL.
                    </p>
                </div>

                {/* Cooldown Warning */}
                {!usernameInfo?.canChange && usernameInfo?.daysUntilChange && usernameInfo.daysUntilChange > 0 && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-medium text-amber-500">Username change on cooldown</div>
                            <p className="text-sm text-amber-500/80 mt-1">
                                You can change your username again in {usernameInfo.daysUntilChange} days.
                                This cooldown helps protect your profile URL.
                            </p>
                        </div>
                    </div>
                )}

                <Card className="border-white/10 bg-white/[0.03]">
                    <CardHeader>
                        <CardTitle>Username</CardTitle>
                        <CardDescription>
                            Your profile will be available at smarana.app/u/{username || "username"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">@</span>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                                    disabled={!usernameInfo?.canChange}
                                    className="pl-8 font-mono"
                                    placeholder="your_username"
                                    maxLength={20}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-white/40">
                                    3-20 characters, letters, numbers, and underscores only.
                                </p>
                                <p className="text-xs text-white/40">{username.length}/20</p>
                            </div>

                            {/* Availability indicator */}
                            {hasChanged && isValid && (
                                <div className="text-sm">
                                    {checking ? (
                                        <span className="text-white/50">Checking availability...</span>
                                    ) : available === true ? (
                                        <span className="text-emerald-500">Username is available</span>
                                    ) : available === false ? (
                                        <span className="text-red-500">Username is already taken</span>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Warning about cooldown */}
                        {usernameInfo?.canChange && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                <AlertCircle className="h-4 w-4 text-white/50 shrink-0 mt-0.5" />
                                <p className="text-xs text-white/50">
                                    After changing your username, you won&apos;t be able to change it again for 90 days.
                                    Old links to your profile will stop working.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setUsername(originalUsername)}
                                disabled={!hasChanged}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-[#BB7331] hover:bg-[#BB7331]/90"
                                onClick={handleSave}
                                disabled={saving || !usernameInfo?.canChange || !hasChanged || !isValid || available === false}
                            >
                                {saving ? "Saving..." : "Save Username"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
