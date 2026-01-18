"use client"

import { useUser, useUpdateLeetCodeUsername, useSync } from "@/hooks/use-problems"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Loader2, RefreshCw, Save } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
    const { data: user, isLoading: userLoading } = useUser()
    const updateUsername = useUpdateLeetCodeUsername()
    const syncMutation = useSync()

    const [username, setUsername] = useState("")

    useEffect(() => {
        if (user?.leetcodeUsername) {
            setUsername(user.leetcodeUsername)
        }
    }, [user])

    const handleSave = () => {
        updateUsername.mutate(username, {
            onSuccess: () => toast.success("Username saved"),
            onError: () => toast.error("Failed to save username"),
        })
    }

    const handleSync = () => {
        syncMutation.mutate(undefined, {
            onSuccess: (data) => toast.success(`Sync complete! Added ${data.added} new problems.`),
            onError: () => toast.error("Sync failed. Check your username."),
        })
    }

    if (userLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="container mx-auto max-w-2xl p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
                <p className="text-muted-foreground">Manage your account and integration settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Google Account</CardTitle>
                    <CardDescription>Signed in via Google OAuth</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.image || ""} />
                        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-lg">{user?.name}</p>
                        <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>LeetCode Integration</CardTitle>
                    <CardDescription>Connect your LeetCode account to sync solved problems.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">LeetCode Username</Label>
                        <div className="flex gap-2">
                            <Input
                                id="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <Button onClick={handleSave} disabled={updateUsername.isPending}>
                                {updateUsername.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            We use this to fetch your public submission history.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 border-t bg-muted/20 p-6">
                    <div className="flex w-full items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Manual Sync</p>
                            <p className="text-sm text-muted-foreground">Trigger a sync to fetch your latest solves.</p>
                        </div>
                        <Button variant={"outline"} onClick={handleSync} disabled={syncMutation.isPending || !user?.leetcodeUsername}>
                            {syncMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Now
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
