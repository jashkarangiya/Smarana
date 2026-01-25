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
import { RefreshCw, User, Link as LinkIcon, CheckCircle2, Lock, AtSign, Clock, Settings, Link2, Shield, Bell, Share2, Download, Check, X, Eye, EyeOff } from "lucide-react"
import { PlatformConnector } from "@/components/platform-connector"
import { AvatarUpload } from "@/components/avatar-upload"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

type SettingsSection = "profile" | "integrations" | "security" | "preferences"

const sections = [
    { id: "profile" as const, label: "Profile", icon: User, description: "Manage your profile information" },
    { id: "integrations" as const, label: "Integrations", icon: Share2, description: "Manage external integrations" },
    { id: "security" as const, label: "Security", icon: Shield, description: "Password and authentication" },
    { id: "preferences" as const, label: "Preferences", icon: Bell, description: "Notifications and display" },
]

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const { data: user, refetch: refetchUser } = useUser()
    const { data: stats } = useStats()
    const { mutate: updateLeetcodeUsername, isPending: updatingLeetcode } = useUpdateLeetCodeUsername()
    const { mutate: sync, isPending: syncing } = useSync()

    const [activeSection, setActiveSection] = useState<SettingsSection>("profile")
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
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Avatar state
    const [avatarUrl, setAvatarUrl] = useState("")
    const [savingAvatar, setSavingAvatar] = useState(false)

    // Privacy settings state
    const [profileVisibility, setProfileVisibility] = useState<"PUBLIC" | "FRIENDS_ONLY" | "PRIVATE">("PUBLIC")
    const [showStreakToPublic, setShowStreakToPublic] = useState(true)
    const [showStreakToFriends, setShowStreakToFriends] = useState(true)
    const [showPlatformsToPublic, setShowPlatformsToPublic] = useState(true)
    const [showPlatformsToFriends, setShowPlatformsToFriends] = useState(true)
    const [savingPrivacy, setSavingPrivacy] = useState(false)

    useEffect(() => {
        if (user?.leetcodeUsername) {
            setLeetcodeUsername(user.leetcodeUsername)
        }
    }, [user])

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

    useEffect(() => {
        const fetchPrivacySettings = async () => {
            try {
                const res = await fetch("/api/me/privacy")
                if (res.ok) {
                    const data = await res.json()
                    setProfileVisibility(data.profileVisibility || "PUBLIC")
                    setShowStreakToPublic(data.showStreakToPublic ?? true)
                    setShowStreakToFriends(data.showStreakToFriends ?? true)
                    setShowPlatformsToPublic(data.showPlatformsToPublic ?? true)
                    setShowPlatformsToFriends(data.showPlatformsToFriends ?? true)
                }
            } catch (e) {
                console.error("Failed to fetch privacy settings", e)
            }
        }
        fetchPrivacySettings()
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
        if (username.length < 3 || username.length > 20) {
            toast.error("Username must be 3-20 characters")
            return
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            toast.error("Username can only contain letters, numbers, and underscores")
            return
        }

        setSavingUsername(true)
        try {
            const res = await fetch("/api/me/username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Username updated!")
                setUsernameInfo({ canChange: false, daysUntilChange: 30 })
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
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in all fields")
            return
        }
        if (newPassword.length < 12) {
            toast.error("Password must be at least 12 characters")
            return
        }
        if (!/[A-Z]/.test(newPassword)) {
            toast.error("Password must contain an uppercase letter")
            return
        }
        if (!/[a-z]/.test(newPassword)) {
            toast.error("Password must contain a lowercase letter")
            return
        }
        if (!/[0-9]/.test(newPassword)) {
            toast.error("Password must contain a number")
            return
        }
        if (!/[^A-Za-z0-9]/.test(newPassword)) {
            toast.error("Password must contain a special character")
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
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
                toast.success(hasPassword ? "Password updated!" : "Password set!")
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
        try {
            new URL(avatarUrl)
        } catch {
            toast.error("Please enter a valid URL")
            return
        }

        setSavingAvatar(true)
        try {
            const res = await fetch("/api/me/avatar", {
                method: "POST",
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

    const handleSavePrivacy = async () => {
        setSavingPrivacy(true)
        try {
            const res = await fetch("/api/me/privacy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileVisibility,
                    showStreakToPublic,
                    showStreakToFriends,
                    showPlatformsToPublic,
                    showPlatformsToFriends
                })
            })
            if (res.ok) {
                toast.success("Privacy settings updated!")
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to update settings")
            }
        } catch (e) {
            toast.error("Failed to update privacy settings")
        } finally {
            setSavingPrivacy(false)
        }
    }

    const handleExportData = async () => {
        try {
            const res = await fetch("/api/me/export")
            if (!res.ok) throw new Error("Failed to export data")

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `smarana-export-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success("Data exported successfully")
        } catch (error) {
            toast.error("Failed to export data")
        }
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 flex-shrink-0">
                    <nav className="space-y-1 lg:sticky lg:top-24">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                                    activeSection === section.id
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <section.icon className="h-5 w-5" />
                                <div>
                                    <p className="font-medium text-sm">{section.label}</p>
                                    <p className="text-xs opacity-70 hidden sm:block">{section.description}</p>
                                </div>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Profile Section */}
                    {activeSection === "profile" && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update your profile picture and display name
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Avatar Display - Clickable to change */}
                                    <div className="flex items-center gap-4">
                                        <AvatarUpload
                                            currentImage={session?.user?.image}
                                            name={session?.user?.name}
                                            onSave={async (imageData) => {
                                                const res = await fetch("/api/me/avatar", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ imageUrl: imageData }),
                                                })
                                                const data = await res.json()
                                                if (res.ok) {
                                                    toast.success("Profile picture updated!")
                                                    await updateSession()
                                                    refetchUser()
                                                } else {
                                                    toast.error(data.error || "Failed to update avatar")
                                                    throw new Error(data.error)
                                                }
                                            }}
                                        />
                                        <div>
                                            <p className="font-semibold text-lg">{session?.user?.name}</p>
                                            <p className="text-sm text-muted-foreground">{maskEmail(session?.user?.email)}</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">Click photo to change</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AtSign className="h-5 w-5" />
                                        Username
                                    </CardTitle>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <CardDescription>
                                            Your unique username for Smarana
                                        </CardDescription>
                                        <Button variant="outline" size="sm" asChild className="shrink-0 gap-2">
                                            <a href={`/u/${username}`} target="_blank" rel="noopener noreferrer">
                                                <Link2 className="h-4 w-4" />
                                                View Public Profile
                                            </a>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            placeholder="your_username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={!usernameInfo?.canChange}
                                            className="font-mono flex-1"
                                        />
                                        <Button
                                            onClick={handleSaveUsername}
                                            disabled={savingUsername || !usernameInfo?.canChange}
                                            className="w-full sm:w-auto"
                                        >
                                            {savingUsername ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        3-20 characters, letters, numbers, and underscores only.
                                    </p>

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
                        </div>
                    )}

                    {/* Integrations Section */}
                    {activeSection === "integrations" && (
                        <div className="space-y-6">
                            <PlatformConnector />

                            {/* Sync All Platforms Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <RefreshCw className="h-5 w-5" />
                                        Sync Problems
                                    </CardTitle>
                                    <CardDescription>
                                        Fetch your latest solved problems from all connected platforms
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {stats && stats.total > 0 && (
                                        <div className="grid grid-cols-3 gap-3 text-center mb-4">
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

                                    <Button onClick={handleSync} disabled={syncing} className="w-full">
                                        <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                                        {syncing ? "Syncing All Platforms..." : "Sync All Platforms"}
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        Syncs problems from LeetCode, Codeforces, AtCoder, and more
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Security Section */}
                    {activeSection === "security" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    {hasPassword ? "Change Password" : "Set Password"}
                                </CardTitle>
                                <CardDescription>
                                    {hasPassword
                                        ? "Update your account password"
                                        : "Add a password to sign in with email and password"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {hasPassword && (
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="current-password"
                                                type={showCurrentPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="new-password"
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {newPassword && (
                                    <div className="space-y-2 p-3 rounded-lg bg-secondary/50">
                                        <p className="text-sm font-medium">Password Requirements:</p>
                                        <div className="space-y-1">
                                            {[
                                                { label: "At least 12 characters", test: newPassword.length >= 12 },
                                                { label: "Contains uppercase letter", test: /[A-Z]/.test(newPassword) },
                                                { label: "Contains lowercase letter", test: /[a-z]/.test(newPassword) },
                                                { label: "Contains number", test: /[0-9]/.test(newPassword) },
                                                { label: "Contains special character", test: /[^A-Za-z0-9]/.test(newPassword) },
                                            ].map((rule, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                    {rule.test ? (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <X className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <span className={cn(
                                                        rule.test ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                                                    )}>
                                                        {rule.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirm-password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                            newPassword === confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                                        )}>
                                            {newPassword === confirmPassword ? (
                                                <><Check className="h-3 w-3" /> Passwords match</>
                                            ) : (
                                                <><X className="h-3 w-3" /> Passwords do not match</>
                                            )}
                                        </p>
                                    )}
                                </div>
                                <Button onClick={handleSavePassword} disabled={savingPassword}>
                                    {savingPassword ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Preferences Section */}
                    {activeSection === "preferences" && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Privacy Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Control who can see your profile and activity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Profile Visibility */}
                                    <div className="space-y-3">
                                        <Label className="text-base">Profile Visibility</Label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="profileVisibility"
                                                    checked={profileVisibility === "PUBLIC"}
                                                    onChange={() => setProfileVisibility("PUBLIC")}
                                                    className="w-4 h-4"
                                                />
                                                <div>
                                                    <p className="font-medium">Public</p>
                                                    <p className="text-sm text-muted-foreground">Anyone can view your profile</p>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="profileVisibility"
                                                    checked={profileVisibility === "FRIENDS_ONLY"}
                                                    onChange={() => setProfileVisibility("FRIENDS_ONLY")}
                                                    className="w-4 h-4"
                                                />
                                                <div>
                                                    <p className="font-medium">Friends Only</p>
                                                    <p className="text-sm text-muted-foreground">Only friends can view your profile</p>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="profileVisibility"
                                                    checked={profileVisibility === "PRIVATE"}
                                                    onChange={() => setProfileVisibility("PRIVATE")}
                                                    className="w-4 h-4"
                                                />
                                                <div>
                                                    <p className="font-medium">Private</p>
                                                    <p className="text-sm text-muted-foreground">Only you can view your profile</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Streak Visibility */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <Label className="text-base">Streak Visibility</Label>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Show streak to public</Label>
                                                    <p className="text-sm text-muted-foreground">Anyone can see your streak stats</p>
                                                </div>
                                                <Switch
                                                    checked={showStreakToPublic}
                                                    onCheckedChange={setShowStreakToPublic}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Show streak to friends</Label>
                                                    <p className="text-sm text-muted-foreground">Friends can see your streak stats</p>
                                                </div>
                                                <Switch
                                                    checked={showStreakToFriends}
                                                    onCheckedChange={setShowStreakToFriends}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Platform Visibility */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <Label className="text-base">Platform Visibility</Label>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Show platforms to public</Label>
                                                    <p className="text-sm text-muted-foreground">Anyone can see your linked accounts</p>
                                                </div>
                                                <Switch
                                                    checked={showPlatformsToPublic}
                                                    onCheckedChange={setShowPlatformsToPublic}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Show platforms to friends</Label>
                                                    <p className="text-sm text-muted-foreground">Friends can see your linked accounts</p>
                                                </div>
                                                <Switch
                                                    checked={showPlatformsToFriends}
                                                    onCheckedChange={setShowPlatformsToFriends}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSavePrivacy}
                                        disabled={savingPrivacy}
                                        className="w-full sm:w-auto"
                                    >
                                        {savingPrivacy ? "Saving..." : "Save Privacy Settings"}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Download className="h-5 w-5" />
                                        Data Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        onClick={handleExportData}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Data (JSON)
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function maskEmail(email: string | null | undefined) {
    if (!email) return ""
    const [name, domain] = email.split("@")
    if (!domain) return email
    const maskedName = name.length > 2 ? `${name.substring(0, 2)}...` : name
    return `${maskedName}@${domain}`
}
