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
import { RefreshCw, User, Link as LinkIcon, CheckCircle2, AlertCircle } from "lucide-react"

export default function ProfilePage() {
    const { data: session } = useSession()
    const { data: user } = useUser()
    const { data: stats } = useStats()
    const { mutate: updateUsername, isPending: updating } = useUpdateLeetCodeUsername()
    const { mutate: sync, isPending: syncing } = useSync()

    const [leetcodeUsername, setLeetcodeUsername] = useState("")

    useEffect(() => {
        if (user?.leetcodeUsername) {
            setLeetcodeUsername(user.leetcodeUsername)
        }
    }, [user])

    const handleSaveUsername = () => {
        if (!leetcodeUsername.trim()) {
            toast.error("Please enter a username")
            return
        }
        updateUsername(leetcodeUsername, {
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
                    <CardContent>
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
                                <Button onClick={handleSaveUsername} disabled={updating}>
                                    {updating ? "Saving..." : "Save"}
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
