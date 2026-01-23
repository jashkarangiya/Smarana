"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2, Link2, Unlink, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface Platform {
    id: string
    name: string
    icon: string
    color: string
    available: boolean
    username: string | null
    connected: boolean
}

// Platform logos as simple colored blocks with emojis
const PlatformIcon = ({ platform }: { platform: Platform }) => (
    <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
        style={{ backgroundColor: platform.color + "20" }}
    >
        {platform.icon}
    </div>
)

export function PlatformConnector() {
    const [platforms, setPlatforms] = useState<Platform[]>([])
    const [loading, setLoading] = useState(true)
    const [editingPlatform, setEditingPlatform] = useState<string | null>(null)
    const [usernameInput, setUsernameInput] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchPlatforms()
    }, [])

    const fetchPlatforms = async () => {
        try {
            const res = await fetch("/api/me/platforms")
            if (res.ok) {
                const data = await res.json()
                setPlatforms(data)
            }
        } catch (error) {
            console.error("Failed to fetch platforms:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = async (platformId: string) => {
        if (!usernameInput.trim()) {
            toast.error("Please enter a username")
            return
        }

        setSaving(true)
        try {
            const res = await fetch("/api/me/platforms", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform: platformId, username: usernameInput.trim() }),
            })

            if (res.ok) {
                toast.success(`Connected to ${platforms.find(p => p.id === platformId)?.name}!`)
                setEditingPlatform(null)
                setUsernameInput("")
                fetchPlatforms()
            } else {
                toast.error("Failed to connect")
            }
        } catch {
            toast.error("Failed to connect")
        } finally {
            setSaving(false)
        }
    }

    const handleDisconnect = async (platformId: string) => {
        setSaving(true)
        try {
            const res = await fetch("/api/me/platforms", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform: platformId, username: null }),
            })

            if (res.ok) {
                toast.success("Disconnected")
                fetchPlatforms()
            }
        } catch {
            toast.error("Failed to disconnect")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Connected Platforms
                </CardTitle>
                <CardDescription>
                    Link your coding profiles to sync solved problems automatically
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {platforms.map((platform) => (
                    <div
                        key={platform.id}
                        className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-secondary/30 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <PlatformIcon platform={platform} />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{platform.name}</span>
                                    {!platform.available && (
                                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                                    )}
                                    {platform.connected && (
                                        <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                            <Check className="h-3 w-3 mr-1" />
                                            Connected
                                        </Badge>
                                    )}
                                </div>
                                {platform.connected && platform.username && (
                                    <p className="text-sm text-muted-foreground">@{platform.username}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {editingPlatform === platform.id ? (
                                <>
                                    <Input
                                        value={usernameInput}
                                        onChange={(e) => setUsernameInput(e.target.value)}
                                        placeholder="Username"
                                        className="w-40"
                                        onKeyDown={(e) => e.key === "Enter" && handleConnect(platform.id)}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => handleConnect(platform.id)}
                                        disabled={saving}
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditingPlatform(null)
                                            setUsernameInput("")
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : platform.connected ? (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingPlatform(platform.id)
                                            setUsernameInput(platform.username || "")
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDisconnect(platform.id)}
                                        disabled={saving}
                                    >
                                        <Unlink className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : platform.available ? (
                                <Button
                                    size="sm"
                                    onClick={() => setEditingPlatform(platform.id)}
                                >
                                    Connect
                                </Button>
                            ) : (
                                <Button size="sm" variant="secondary" disabled>
                                    Soon
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
