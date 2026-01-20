"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser, useUpdateLeetCodeUsername, useSync, useStats } from "@/hooks/use-problems"
import { toast } from "sonner"
import { RefreshCw, User, Link as LinkIcon, CheckCircle2, AlertCircle, Lock, AtSign, Camera, Clock } from "lucide-react"

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const { data: user, refetch: refetchUser } = useUser()
    const { data: stats } = useStats()
    const { mutate: updateLeetcodeUsername, isPending: updatingLeetcode } = useUpdateLeetCodeUsername()
    const { mutate: sync, isPending: syncing } = useSync()

    const [leetcodeUsername, setLeetcodeUsername] = useState("")

    // Username state
    const [username, setUsername] = useState("")
    const [usernameInfo, setUsernameInfo] = useState<{ canChange: boolean; daysUntilChange: number } | null>(null)
    const [savingUsername, setSavingUsername] = useState(false)

    // Password state
    const [hasPassword, setHasPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [savingPassword, setSavingPassword] = useState(false)

    // Avatar state
    const [avatarUrl, setAvatarUrl] = useState("")
    const [savingAvatar, setSavingAvatar] = useState(false)

    useEffect(() => {
        if (user?.leetcodeUsername) {
            setLeetcodeUsername(user.leetcodeUsername)
        }
    }, [user])

    // Fetch username info
    useEffect(() => {
        const fetchUsernameInfo = async () => {
            try {
                const res = await fetch("/api/me/username")
                if (res.ok) {
                    const data = await res.json()
                    setUsername(data.username || "")
                    setUsernameInfo({ canChange: data.canChange, daysUntilChange: data.daysUntilChange })
                }
            } catch (e) {
                console.error("Failed to fetch username", e)
            }
        }
        fetchUsernameInfo()
    }, [])

    // Fetch password status
    useEffect(() => {
        const fetchPasswordStatus = async () => {
            try {
                const res = await fetch("/api/me/password")
                if (res.ok) {
                    const data = await res.json()
                    setHasPassword(data.hasPassword)
                }
            } catch (e) {
                console.error("Failed to fetch password status", e)
            }
        }
        fetchPasswordStatus()
    }, [])

    const handleSaveLeetcodeUsername = () => {
        if (!leetcodeUsername.trim()) {
            toast.error("Please enter a username")
            return
        }
        updateLeetcodeUsername(leetcodeUsername, {
            onSuccess: () => toast.success("LeetCode username saved successfully"),
            onError: (error) => toast.error(error.message || "Failed to save username"),
        })
    }

    const handleSync = () => {
        sync(undefined, {
            onSuccess: (data: any) => toast.success(`Synced ${data.added || 0} new problems`),
            onError: () => toast.error("Sync failed. Check your username."),
        })
    }

    const handleSaveUsername = async () => {
        if (!username.trim()) {
            toast.error("Please enter a username")
            return
        }

        setSavingUsername(true)
        try {
            const res = await fetch("/api/me/username", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            })
            const data = await res.json()

            if (res.ok) {
                toast.success("Username updated successfully!")
                setUsernameInfo({ canChange: false, daysUntilChange: 90 })
            } else {
                toast.error(data.error || "Failed to update username")
            }
        } catch (e) {
            toast.error("Failed to update username")
        } finally {
            setSavingUsername(false)
        }
    }

    const handleSavePassword = async () => {
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match")
            return
        }
        if (hasPassword && !currentPassword) {
            toast.error("Please enter your current password")
            return
        }

        setSavingPassword(true)
        try {
            const res = await fetch("/api/me/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const data = await res.json()

            if (res.ok) {
                toast.success(hasPassword ? "Password changed!" : "Password set successfully!")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
                setHasPassword(true)
            } else {
                toast.error(data.error || "Failed to update password")
            }
        } catch (e) {
            toast.error("Failed to update password")
        } finally {
            setSavingPassword(false)
        }
    }

    const handleSaveAvatar = async () => {
        if (!avatarUrl.trim()) {
            toast.error("Please enter an image URL")
            return
        }

        setSavingAvatar(true)
        try {
            const res = await fetch("/api/me/avatar", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: avatarUrl }),
            })
            const data = await res.json()

            if (res.ok) {
                toast.success("Profile picture updated!")
                setAvatarUrl("")
                await updateSession()
                refetchUser()
            } else {
                toast.error(data.error || "Failed to update avatar")
            }
        } catch (e) {
            toast.error("Failed to update avatar")
        } finally {
            setSavingAvatar(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

            <div className="space-y-6">
                {/* Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={session?.user?.image || ""} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-lg">{session?.user?.name}</p>
                                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                            </div>
                        </div>

                        {/* Change Avatar */}
                        <div className="pt-4 border-t space-y-2">
                            <Label htmlFor="avatar" className="flex items-center gap-2">
                                <Camera className="h-3 w-3" />
                                Change Profile Picture
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="avatar"
                                    placeholder="https://example.com/your-image.jpg"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                />
                                <Button onClick={handleSaveAvatar} disabled={savingAvatar} size="sm">
                                    {savingAvatar ? "Saving..." : "Update"}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enter a URL to an image (JPG, PNG, or GIF)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Username */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AtSign className="h-4 w-4" />
                            Username
                        </CardTitle>
                        <CardDescription>
                            Your unique username for AlgoRecall. Friends can add you with this.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="username"
                                    placeholder="your_username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={!usernameInfo?.canChange}
                                    className="font-mono"
                                />
                                <Button
                                    onClick={handleSaveUsername}
                                    disabled={savingUsername || !usernameInfo?.canChange}
                                >
                                    {savingUsername ? "Saving..." : "Save"}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                3-20 characters, letters, numbers, and underscores only.
                            </p>
                        </div>

                        {!usernameInfo?.canChange && usernameInfo?.daysUntilChange && usernameInfo.daysUntilChange > 0 && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <Clock className="h-4 w-4 text-amber-500" />
                                <span className="text-sm text-amber-500">
                                    You can change your username in {usernameInfo.daysUntilChange} days
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            {hasPassword ? "Change Password" : "Set Password"}
                        </CardTitle>
                        <CardDescription>
                            {hasPassword
                                ? "Update your account password"
                                : "Set a password to login with your username or email"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hasPassword && (
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="At least 6 characters"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleSavePassword} disabled={savingPassword}>
                            {savingPassword ? "Saving..." : hasPassword ? "Change Password" : "Set Password"}
                        </Button>
                    </CardContent>
                </Card>

                {/* LeetCode Integration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            LeetCode Integration
                        </CardTitle>
                        <CardDescription>
                            Connect your LeetCode account to sync solved problems
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="leetcode">LeetCode Username</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="leetcode"
                                    placeholder="your-leetcode-username"
                                    value={leetcodeUsername}
                                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                                    className="font-mono"
                                />
                                <Button onClick={handleSaveLeetcodeUsername} disabled={updatingLeetcode}>
                                    {updatingLeetcode ? "Saving..." : "Save"}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This is the username from your LeetCode profile URL (leetcode.com/u/username)
                            </p>
                        </div>

                        {user?.leetcodeUsername && (
                            <div className="pt-4 border-t space-y-4">
                                {/* Connection Status */}
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-emerald-500">
                                        Connected as @{user.leetcodeUsername}
                                    </span>
                                </div>

                                {/* Stats Summary */}
                                {stats && stats.total > 0 && (
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div className="p-3 rounded-lg bg-secondary">
                                            <p className="text-lg font-bold text-emerald-500">{stats.easy}</p>
                                            <p className="text-xs text-muted-foreground">Easy</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-secondary">
                                            <p className="text-lg font-bold text-amber-500">{stats.medium}</p>
                                            <p className="text-xs text-muted-foreground">Medium</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-secondary">
                                            <p className="text-lg font-bold text-rose-500">{stats.hard}</p>
                                            <p className="text-xs text-muted-foreground">Hard</p>
                                        </div>
                                    </div>
                                )}

                                {/* Sync Button */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm">Sync Problems</p>
                                        <p className="text-xs text-muted-foreground">
                                            Fetch latest solved problems from LeetCode
                                        </p>
                                    </div>
                                    <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
                                        <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                                        {syncing ? "Syncing..." : "Sync Now"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info */}
                <Card className="border-muted bg-secondary/30">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">How it works</p>
                                <p>
                                    AlgoRecall uses spaced repetition to help you remember algorithms.
                                    After syncing, problems are scheduled for review at optimal intervals:
                                    1 day, 3 days, 7 days, 14 days, and 30 days.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
