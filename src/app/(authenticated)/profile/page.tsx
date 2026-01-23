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
import { RefreshCw, User, Link as LinkIcon, CheckCircle2, Lock, AtSign, Clock, Settings, Link2, Shield, Bell } from "lucide-react"
import { PlatformConnector } from "@/components/platform-connector"
import { AvatarUpload } from "@/components/avatar-upload"
import { cn } from "@/lib/utils"

type SettingsSection = "profile" | "platforms" | "security" | "preferences"

const sections = [
    { id: "profile" as const, label: "Profile", icon: User, description: "Manage your profile information" },
    { id: "platforms" as const, label: "Platforms", icon: Link2, description: "Connect coding platforms" },
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
                                            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
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
                                    <CardDescription>
                                        Your unique username for AlgoRecall
                                    </CardDescription>
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

                    {/* Platforms Section */}
                    {activeSection === "platforms" && (
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
                                        : "Add a password to sign in with email"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {hasPassword && (
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input
                                            id="current-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleSavePassword} disabled={savingPassword}>
                                    {savingPassword ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 8 characters long.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Preferences Section */}
                    {activeSection === "preferences" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Preferences
                                </CardTitle>
                                <CardDescription>
                                    Customize your experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Settings className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg">Coming Soon</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mt-1">
                                        Notification settings, theme preferences, and more will be available here.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
