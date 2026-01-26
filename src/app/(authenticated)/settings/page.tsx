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
import { RefreshCw, User, Link as LinkIcon, CheckCircle2, Lock, AtSign, Clock, Settings, Link2, Shield, Bell, Share2, Download, ArrowLeft, Eye, EyeOff, Globe, ExternalLink, Copy, Check } from "lucide-react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { PlatformConnector } from "@/components/platform-connector"
import { AvatarUpload } from "@/components/avatar-upload"
import { cn } from "@/lib/utils"

type SettingsSection = "basic" | "details" | "platforms" | "visibility" | "accounts"

const sections = [
    { id: "basic" as const, label: "Basic Info", icon: User, description: "Name and profile picture" },
    { id: "details" as const, label: "Profile Details", icon: AtSign, description: "Username and bio" },
    { id: "platforms" as const, label: "Platform", icon: Share2, description: "Connected platforms" },
    { id: "visibility" as const, label: "Visibility", icon: Eye, description: "Privacy settings" },
    { id: "accounts" as const, label: "Accounts", icon: Shield, description: "Password and security" },
]

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const { data: user, refetch: refetchUser } = useUser()
    const { data: stats } = useStats()
    const { mutate: updateLeetcodeUsername, isPending: updatingLeetcode } = useUpdateLeetCodeUsername()
    const { mutate: sync, isPending: syncing } = useSync()

    const [activeSection, setActiveSection] = useState<SettingsSection>("basic")
    const [isPublicProfile, setIsPublicProfile] = useState(true)
    const [copied, setCopied] = useState(false)
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
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setSavingPassword(true)
        try {
            const res = await fetch("/api/me/password", {
                method: "POST",
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

    const copyProfileUrl = () => {
        const url = `${window.location.origin}/u/${username}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("Profile URL copied!")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
            {/* Back Link */}
            <Link
                href={`/u/${username}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm mb-4 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
            </Link>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 flex-shrink-0">
                    <Card className="sticky top-24">
                        <CardContent className="p-2">
                            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all shrink-0 w-full",
                                            activeSection === section.id
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <section.icon className="h-5 w-5 shrink-0" />
                                        <span className="font-medium text-sm whitespace-nowrap">{section.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Basic Info Section */}
                    {activeSection === "basic" && (
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Basic Info</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Update your profile picture and display name
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-4 sm:p-6 pt-0">
                                {/* Avatar Upload */}
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
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-lg truncate">{session?.user?.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{maskEmail(session?.user?.email)}</p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">Click photo to change</p>
                                    </div>
                                </div>

                                {/* Display Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="display-name">Display Name</Label>
                                    <Input
                                        id="display-name"
                                        placeholder="Your name"
                                        defaultValue={session?.user?.name || ""}
                                        className="max-w-md"
                                    />
                                </div>

                                {/* Email (read-only) */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={session?.user?.email || ""}
                                        disabled
                                        className="max-w-md bg-muted/50"
                                    />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Profile Details Section */}
                    {activeSection === "details" && (
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Profile Details</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Your public profile information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-4 sm:p-6 pt-0">
                                {/* Username */}
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <div className="flex gap-2 max-w-md">
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
                                    {!usernameInfo?.canChange && usernameInfo?.daysUntilChange && usernameInfo.daysUntilChange > 0 && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 max-w-md">
                                            <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                                            <span className="text-sm text-amber-500">
                                                You can change your username in {usernameInfo.daysUntilChange} days
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <textarea
                                        id="bio"
                                        placeholder="Tell others about yourself..."
                                        className="w-full max-w-md h-24 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                    <p className="text-xs text-muted-foreground">Brief description for your profile</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Platforms Section */}
                    {activeSection === "platforms" && (
                        <div className="space-y-6">
                            <PlatformConnector />

                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="text-base sm:text-lg">Sync Problems</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Fetch your latest solved problems from all connected platforms
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    {stats && stats.total > 0 && (
                                        <div className="grid grid-cols-3 gap-3 text-center mb-4">
                                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                <p className="text-lg font-bold text-emerald-500">{stats.easy}</p>
                                                <p className="text-xs text-muted-foreground">Easy</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                                <p className="text-lg font-bold text-amber-500">{stats.medium}</p>
                                                <p className="text-xs text-muted-foreground">Medium</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                                <p className="text-lg font-bold text-rose-500">{stats.hard}</p>
                                                <p className="text-xs text-muted-foreground">Hard</p>
                                            </div>
                                        </div>
                                    )}

                                    <Button onClick={handleSync} disabled={syncing} className="w-full">
                                        <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                                        {syncing ? "Syncing..." : "Sync All Platforms"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Visibility Section */}
                    {activeSection === "visibility" && (
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Visibility</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Control who can see your profile and activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-4 sm:p-6 pt-0">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-base">Public Profile</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Allow others to view your profile and progress
                                        </p>
                                    </div>
                                    <Switch
                                        checked={isPublicProfile}
                                        onCheckedChange={setIsPublicProfile}
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Share2 className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-base">Show Activity</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Display your review activity on your profile
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Bell className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-base">Email Notifications</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Receive daily review reminders
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Accounts Section */}
                    {activeSection === "accounts" && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="text-base sm:text-lg">
                                        {hasPassword ? "Change Password" : "Set Password"}
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        {hasPassword
                                            ? "Update your account password"
                                            : "Add a password to sign in with email"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                                    {hasPassword && (
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password">Current Password</Label>
                                            <div className="relative max-w-md">
                                                <Input
                                                    id="current-password"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <div className="relative max-w-md">
                                            <Input
                                                id="new-password"
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm Password</Label>
                                        <div className="relative max-w-md">
                                            <Input
                                                id="confirm-password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button onClick={handleSavePassword} disabled={savingPassword}>
                                        {savingPassword ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        Password must be at least 8 characters long.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="text-base sm:text-lg">Data Management</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Export or manage your account data
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <Button variant="outline" onClick={handleExportData}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Data (JSON)
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Profile Preview Card - Right Side */}
                <aside className="hidden xl:block w-72 flex-shrink-0">
                    <Card className="sticky top-24">
                        <CardContent className="p-4">
                            {/* Public Profile Toggle */}
                            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Public Profile</span>
                                </div>
                                <Switch
                                    checked={isPublicProfile}
                                    onCheckedChange={setIsPublicProfile}
                                />
                            </div>

                            {/* Refresh Button */}
                            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                                <RefreshCw className="h-4 w-4" />
                                Refresh Now
                            </button>

                            {/* Profile Preview */}
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                        <AvatarImage src={session?.user?.image || ""} />
                                        <AvatarFallback className="text-2xl">
                                            {session?.user?.name?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-background border shadow-sm hover:bg-muted transition-colors">
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                </div>

                                <h3 className="font-semibold text-lg">{session?.user?.name}</h3>
                                <Link
                                    href={`/u/${username}`}
                                    className="text-primary text-sm hover:underline"
                                >
                                    @{username}
                                </Link>

                                {/* Copy Profile URL */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-4"
                                    onClick={copyProfileUrl}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Profile URL
                                        </>
                                    )}
                                </Button>

                                {/* Stats Preview */}
                                {stats && stats.total > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs text-muted-foreground mb-2">Problems Solved</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </aside>
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
