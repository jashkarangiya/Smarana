"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser, useSync, useStats } from "@/hooks/use-problems"
import { toast } from "sonner"
import {
    RefreshCw, User, CheckCircle2, Clock, Share2, Download,
    ArrowLeft, Eye, EyeOff, Globe, ExternalLink, Copy, Check, Shield,
    Users, Lock, Bell
} from "lucide-react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { PlatformConnector } from "@/components/features/profile/platform-connector"
import { AvatarUpload } from "@/components/features/profile/avatar-upload"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type SettingsSection = "basic" | "platforms" | "visibility" | "accounts" | "notifications"

const sections = [
    { id: "basic" as const, label: "Basic Info", icon: User, description: "Profile and personal details" },
    { id: "platforms" as const, label: "Platforms", icon: Share2, description: "Connected platforms and sync" },
    { id: "notifications" as const, label: "Notifications", icon: Bell, description: "Email and updates" },
    { id: "visibility" as const, label: "Visibility", icon: Eye, description: "Privacy and sharing settings" },
    { id: "accounts" as const, label: "Accounts", icon: Shield, description: "Password and security" },
]

// Common timezone options
const TIMEZONES = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (US & Canada)" },
    { value: "America/Chicago", label: "Central Time (US & Canada)" },
    { value: "America/Denver", label: "Mountain Time (US & Canada)" },
    { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
    { value: "America/Anchorage", label: "Alaska" },
    { value: "Pacific/Honolulu", label: "Hawaii" },
    { value: "Europe/London", label: "London" },
    { value: "Europe/Paris", label: "Paris" },
    { value: "Europe/Berlin", label: "Berlin" },
    { value: "Europe/Moscow", label: "Moscow" },
    { value: "Asia/Dubai", label: "Dubai" },
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "Asia/Singapore", label: "Singapore" },
    { value: "Asia/Shanghai", label: "China (CST)" },
    { value: "Asia/Tokyo", label: "Tokyo" },
    { value: "Asia/Seoul", label: "Seoul" },
    { value: "Australia/Sydney", label: "Sydney" },
    { value: "Pacific/Auckland", label: "Auckland" },
]

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const { data: user, refetch: refetchUser } = useUser()
    const { data: stats } = useStats()
    const { mutate: sync, isPending: syncing } = useSync()

    const [activeSection, setActiveSection] = useState<SettingsSection>("basic")
    const [copied, setCopied] = useState(false)

    // Basic Info form state
    const [displayName, setDisplayName] = useState("")
    const [bio, setBio] = useState("")
    const [timezone, setTimezone] = useState("UTC")
    const [savingBasicInfo, setSavingBasicInfo] = useState(false)

    // Username state
    const [username, setUsername] = useState("")
    const [usernameInfo, setUsernameInfo] = useState<{ canChange: boolean; daysUntilChange: number } | null>(null)

    // Password state
    const [hasPassword, setHasPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [savingPassword, setSavingPassword] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Visibility state
    const [profileVisibility, setProfileVisibility] = useState<"PUBLIC" | "FRIENDS_ONLY" | "PRIVATE">("PUBLIC")
    const [showStreakPublicly, setShowStreakPublicly] = useState(true)
    const [showPlatformsPublicly, setShowPlatformsPublicly] = useState(true)
    const [showBioPublicly, setShowBioPublicly] = useState(true)
    const [showTimezoneToPublic, setShowTimezoneToPublic] = useState(false)
    const [showTimezoneToFriends, setShowTimezoneToFriends] = useState(true)
    const [savingVisibility, setSavingVisibility] = useState(false)

    // Notification state
    const [emailReviewRemindersEnabled, setEmailReviewRemindersEnabled] = useState(false)
    const [savingNotifications, setSavingNotifications] = useState(false)

    // Track if form has unsaved changes
    const initialBasicInfo = useMemo(() => ({
        displayName: user?.name || session?.user?.name || "",
        bio: user?.bio || "",
        timezone: user?.timezone || "UTC",
    }), [user, session])

    const hasUnsavedChanges = useMemo(() => {
        return (
            displayName !== initialBasicInfo.displayName ||
            bio !== initialBasicInfo.bio ||
            timezone !== initialBasicInfo.timezone
        )
    }, [displayName, bio, timezone, initialBasicInfo])

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setDisplayName(user.name || "")
            setBio(user.bio || "")
            setTimezone(user.timezone || "UTC")
            setProfileVisibility(user.profileVisibility as "PUBLIC" | "FRIENDS_ONLY" | "PRIVATE" || "PUBLIC")
            setShowStreakPublicly(user.showStreakToPublic ?? true)
            setShowPlatformsPublicly(user.showPlatformsToPublic ?? true)
            setShowBioPublicly(user.showBioPublicly ?? true)
            setShowBioPublicly(user.showBioPublicly ?? true)
            setShowTimezoneToPublic(user.showTimezoneToPublic ?? false)
            setShowTimezoneToFriends(user.showTimezoneToFriends ?? true)
            // @ts-ignore - type update might delay
            setEmailReviewRemindersEnabled(user.emailReviewRemindersEnabled ?? false)
        } else if (session?.user?.name) {
            setDisplayName(session.user.name)
        }
    }, [user, session])

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

    const handleSync = () => {
        sync(undefined, {
            onSuccess: (data: { added?: number }) => toast.success(`Synced ${data.added || 0} new problems`),
            onError: () => toast.error("Sync failed. Check your username."),
        })
    }

    const handleSaveBasicInfo = async () => {
        if (!displayName.trim()) {
            toast.error("Display name cannot be empty")
            return
        }

        setSavingBasicInfo(true)
        try {
            const res = await fetch("/api/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: displayName.trim(),
                    bio: bio.trim(),
                    timezone,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Profile updated!")
                await updateSession()
                refetchUser()
            } else {
                toast.error(data.error || "Failed to update profile")
            }
        } catch {
            toast.error("Failed to update profile")
        } finally {
            setSavingBasicInfo(false)
        }
    }

    const handleCancelBasicInfo = () => {
        setDisplayName(initialBasicInfo.displayName)
        setBio(initialBasicInfo.bio)
        setTimezone(initialBasicInfo.timezone)
    }

    const handleSaveVisibility = async () => {
        setSavingVisibility(true)
        try {
            const res = await fetch("/api/me/privacy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileVisibility,
                    showStreakToPublic: showStreakPublicly,
                    showPlatformsToPublic: showPlatformsPublicly,
                    showBioPublicly,
                    showTimezoneToPublic,
                    showTimezoneToFriends,
                }),
            })
            if (res.ok) {
                toast.success("Privacy settings updated!")
                refetchUser()
            } else {
                toast.error("Failed to update privacy settings")
            }
        } catch {
            toast.error("Failed to update privacy settings")
        } finally {
            setSavingVisibility(false)
        }
    }

    const handleSaveNotifications = async () => {
        setSavingNotifications(true)
        try {
            const res = await fetch("/api/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailReviewRemindersEnabled,
                }),
            })
            if (res.ok) {
                toast.success("Notification settings updated!")
                refetchUser()
            } else {
                toast.error("Failed to update notification settings")
            }
        } catch {
            toast.error("Failed to update notification settings")
        } finally {
            setSavingNotifications(false)
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
        } catch {
            toast.error("Failed to update password")
        } finally {
            setSavingPassword(false)
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
        } catch {
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
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl">
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
                <aside className="lg:w-56 flex-shrink-0">
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
                        <div className="space-y-6">
                            {/* Page Header with Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-semibold text-white/90">Basic Info</h1>
                                    <p className="text-sm text-white/50 mt-1">Update your photo, name, and profile basics.</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={copyProfileUrl}>
                                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                        {copied ? "Copied!" : "Copy Link"}
                                    </Button>
                                    {profileVisibility === "PUBLIC" && username && (
                                        <Button size="sm" className="bg-[#BB7331] hover:bg-[#BB7331]/90" asChild>
                                            <Link href={`/u/${username}`}>
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View Profile
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Profile Header Card */}
                            <Card className="border-white/10 bg-white/[0.03]">
                                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-5">
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
                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="text-lg font-semibold text-white/90">{displayName || session?.user?.name}</div>
                                        <div className="text-sm text-white/50">{session?.user?.email}</div>
                                        <div className="mt-1 text-xs text-white/40">Click photo to update your avatar</div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Profile Fields Card */}
                            <Card className="border-white/10 bg-white/[0.03]">
                                <CardContent className="p-6 space-y-6">
                                    {/* Display Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="display-name">Display Name</Label>
                                        <Input
                                            id="display-name"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Your name"
                                            className="max-w-md"
                                        />
                                        <p className="text-xs text-white/40">Shown on your profile and in friend activity.</p>
                                    </div>

                                    <Separator className="bg-white/10" />

                                    {/* Username (read-only with edit link) */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label>Username</Label>
                                            <div className="text-sm text-white/70 font-mono">@{username || "not set"}</div>
                                            <p className="text-xs text-white/40">
                                                {usernameInfo?.canChange
                                                    ? "You can change your username once (90-day cooldown after first change)."
                                                    : usernameInfo?.daysUntilChange && usernameInfo.daysUntilChange > 0
                                                        ? `Next change available in ${usernameInfo.daysUntilChange} days.`
                                                        : "Username changes are limited to protect your profile URL."}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/settings/username">Edit</Link>
                                        </Button>
                                    </div>

                                    <Separator className="bg-white/10" />

                                    {/* Email (read-only) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={session?.user?.email || ""}
                                            disabled
                                            className="max-w-md bg-muted/50"
                                        />
                                        <p className="text-xs text-white/40">Email can&apos;t be changed here.</p>
                                    </div>

                                    <Separator className="bg-white/10" />

                                    {/* Timezone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select value={timezone} onValueChange={setTimezone}>
                                            <SelectTrigger className="max-w-md">
                                                <SelectValue placeholder="Select timezone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TIMEZONES.map((tz) => (
                                                    <SelectItem key={tz.value} value={tz.value}>
                                                        {tz.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-white/40">Used for scheduling and streak accuracy.</p>
                                    </div>

                                    <Separator className="bg-white/10" />

                                    {/* Bio */}
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value.slice(0, 160))}
                                            placeholder="Tell others about yourself..."
                                            className="max-w-md h-24 resize-none"
                                            maxLength={160}
                                        />
                                        <div className="flex justify-between text-xs text-white/40 max-w-md">
                                            <span>Optional. Shows on your public profile.</span>
                                            <span>{bio.length}/160</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sticky Save Bar */}
                            {hasUnsavedChanges && (
                                <div className="sticky bottom-4 z-10">
                                    <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="text-sm text-white/60">You have unsaved changes</div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={handleCancelBasicInfo}>
                                                Cancel
                                            </Button>
                                            <Button
                                                className="bg-[#BB7331] hover:bg-[#BB7331]/90"
                                                onClick={handleSaveBasicInfo}
                                                disabled={savingBasicInfo}
                                            >
                                                {savingBasicInfo ? "Saving..." : "Save changes"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Platforms Section */}
                    {activeSection === "platforms" && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-semibold text-white/90">Platforms</h1>
                                <p className="text-sm text-white/50 mt-1">Connect your coding platforms and sync your progress.</p>
                            </div>

                            <PlatformConnector />

                            <Card className="border-white/10 bg-white/[0.03]">
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

                    {/* Notifications Section */}
                    {activeSection === "notifications" && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-semibold text-white/90">Notifications</h1>
                                <p className="text-sm text-white/50 mt-1">Manage your email preferences and alerts.</p>
                            </div>

                            <Card className="border-white/10 bg-white/[0.03]">
                                <CardContent className="p-6 space-y-6">
                                    {/* Email Review Reminders */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-base">Email Review Reminders</Label>
                                            <p className="text-sm text-white/50">
                                                Receive a daily email when you have problems due for review.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={emailReviewRemindersEnabled}
                                            onCheckedChange={setEmailReviewRemindersEnabled}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                className="bg-[#BB7331] hover:bg-[#BB7331]/90"
                                onClick={handleSaveNotifications}
                                disabled={savingNotifications}
                            >
                                {savingNotifications ? "Saving..." : "Save Notification Settings"}
                            </Button>
                        </div>
                    )}

                    {/* Visibility Section */}
                    {activeSection === "visibility" && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-semibold text-white/90">Visibility</h1>
                                <p className="text-sm text-white/50 mt-1">Control who can see your profile and activity.</p>
                            </div>

                            <Card className="border-white/10 bg-white/[0.03]">
                                <CardContent className="p-6 space-y-6">
                                    {/* Profile Visibility */}
                                    <div className="space-y-4">
                                        <Label className="text-base">Profile Visibility</Label>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setProfileVisibility("PUBLIC")}
                                                className={cn(
                                                    "w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left",
                                                    profileVisibility === "PUBLIC"
                                                        ? "border-[#BB7331] bg-[#BB7331]/10"
                                                        : "border-white/10 hover:border-white/20"
                                                )}
                                            >
                                                <Globe className="h-5 w-5 text-white/70" />
                                                <div className="flex-1">
                                                    <div className="font-medium text-white/90">Public</div>
                                                    <div className="text-sm text-white/50">Anyone can view your profile</div>
                                                </div>
                                                {profileVisibility === "PUBLIC" && (
                                                    <CheckCircle2 className="h-5 w-5 text-[#BB7331]" />
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setProfileVisibility("FRIENDS_ONLY")}
                                                className={cn(
                                                    "w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left",
                                                    profileVisibility === "FRIENDS_ONLY"
                                                        ? "border-[#BB7331] bg-[#BB7331]/10"
                                                        : "border-white/10 hover:border-white/20"
                                                )}
                                            >
                                                <Users className="h-5 w-5 text-white/70" />
                                                <div className="flex-1">
                                                    <div className="font-medium text-white/90">Friends Only</div>
                                                    <div className="text-sm text-white/50">Only friends can view your profile</div>
                                                </div>
                                                {profileVisibility === "FRIENDS_ONLY" && (
                                                    <CheckCircle2 className="h-5 w-5 text-[#BB7331]" />
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setProfileVisibility("PRIVATE")}
                                                className={cn(
                                                    "w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left",
                                                    profileVisibility === "PRIVATE"
                                                        ? "border-[#BB7331] bg-[#BB7331]/10"
                                                        : "border-white/10 hover:border-white/20"
                                                )}
                                            >
                                                <Lock className="h-5 w-5 text-white/70" />
                                                <div className="flex-1">
                                                    <div className="font-medium text-white/90">Private</div>
                                                    <div className="text-sm text-white/50">Only you can view your profile</div>
                                                </div>
                                                {profileVisibility === "PRIVATE" && (
                                                    <CheckCircle2 className="h-5 w-5 text-[#BB7331]" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <Separator className="bg-white/10" />

                                    {/* Show Streak Publicly */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-base">Show Streak</Label>
                                            <p className="text-sm text-white/50">
                                                Display your streak on your public profile
                                            </p>
                                        </div>
                                        <Switch
                                            checked={showStreakPublicly}
                                            onCheckedChange={setShowStreakPublicly}
                                        />
                                    </div>

                                    <Separator className="bg-white/10" />

                                    {/* Show Platforms Publicly */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-base">Show Platform Usernames</Label>
                                            <p className="text-sm text-white/50">
                                                Display your LeetCode, Codeforces usernames publicly
                                            </p>
                                        </div>
                                        <Switch
                                            checked={showPlatformsPublicly}
                                            onCheckedChange={setShowPlatformsPublicly}
                                        />
                                    </div>

                                    <Separator className="bg-white/10" />

                                    {/* Show Bio Publicly */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-base">Show Bio</Label>
                                            <p className="text-sm text-white/50">
                                                Display your bio on your public profile
                                            </p>
                                        </div>
                                        <Switch
                                            checked={showBioPublicly}
                                            onCheckedChange={setShowBioPublicly}
                                        />
                                    </div>

                                    <Separator className="bg-white/10" />

                                    {/* Show Timezone */}
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label className="text-base">Show Local Time</Label>
                                            <p className="text-sm text-white/50">
                                                Display your local time on your profile (based on timezone)
                                            </p>
                                        </div>
                                        <div className="space-y-3 pl-4 border-l-2 border-white/10">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-sm text-white/70">Show to everyone</span>
                                                <Switch
                                                    checked={showTimezoneToPublic}
                                                    onCheckedChange={setShowTimezoneToPublic}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-sm text-white/70">Show to friends</span>
                                                <Switch
                                                    checked={showTimezoneToFriends}
                                                    onCheckedChange={setShowTimezoneToFriends}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-white/10" />

                                    {/* Profile Actions */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button variant="outline" onClick={copyProfileUrl}>
                                            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                            Copy Profile URL
                                        </Button>
                                        {profileVisibility === "PUBLIC" && username && (
                                            <Button variant="outline" asChild>
                                                <Link href={`/u/${username}`}>
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    View Profile
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                className="bg-[#BB7331] hover:bg-[#BB7331]/90"
                                onClick={handleSaveVisibility}
                                disabled={savingVisibility}
                            >
                                {savingVisibility ? "Saving..." : "Save Privacy Settings"}
                            </Button>
                        </div>
                    )}

                    {/* Accounts Section */}
                    {activeSection === "accounts" && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-semibold text-white/90">Accounts</h1>
                                <p className="text-sm text-white/50 mt-1">Manage your password and account security.</p>
                            </div>

                            <Card className="border-white/10 bg-white/[0.03]">
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

                            <Card className="border-white/10 bg-white/[0.03]">
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
            </div>
        </div >
    )
}
