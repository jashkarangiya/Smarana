"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, Link2, Trash2, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

// Platform configurations with URL patterns and SVG icons
const PLATFORM_CONFIG = [
    {
        id: "leetcode",
        name: "LeetCode",
        icon: "/platforms/leetcode.svg",
        color: "#FFA116",
        urlPrefix: "leetcode.com/u/",
        available: true,
    },
    {
        id: "codeforces",
        name: "CodeForces",
        icon: "/platforms/codeforces.svg",
        color: "#1F8ACB",
        urlPrefix: "codeforces.com/profile/",
        available: true,
    },
    {
        id: "codechef",
        name: "CodeChef",
        icon: "/platforms/codechef.svg",
        color: "#5B4638",
        urlPrefix: "codechef.com/users/",
        available: true,
    },
    {
        id: "atcoder",
        name: "AtCoder",
        icon: "/platforms/atcoder.svg",
        color: "#222222",
        urlPrefix: "atcoder.jp/users/",
        available: true,
    },
    {
        id: "hackerrank",
        name: "HackerRank",
        icon: "/platforms/hackerrank.svg",
        color: "#00EA64",
        urlPrefix: "hackerrank.com/profile/",
        available: false,
    },
    {
        id: "geeksforgeeks",
        name: "GeeksForGeeks",
        icon: "/platforms/geeksforgeeks.svg",
        color: "#2F8D46",
        urlPrefix: "geeksforgeeks.org/user/",
        available: false,
    },
    {
        id: "interviewbit",
        name: "InterviewBit",
        icon: "/platforms/interviewbit.svg",
        color: "#5B9BD5",
        urlPrefix: "interviewbit.com/profile/",
        available: false,
    },
    {
        id: "codestudio",
        name: "CodeStudio",
        icon: "/platforms/codestudio.svg",
        color: "#FF6B35",
        urlPrefix: "naukri.com/code360/profile/",
        available: false,
    },
]

interface PlatformState {
    [key: string]: {
        username: string
        connected: boolean
        editing: boolean
        saving: boolean
    }
}

export function PlatformConnector() {
    const [platforms, setPlatforms] = useState<PlatformState>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPlatforms()
    }, [])

    const fetchPlatforms = async () => {
        try {
            const res = await fetch("/api/me/platforms")
            if (res.ok) {
                const data = await res.json()
                const state: PlatformState = {}

                // Initialize all platforms from config
                PLATFORM_CONFIG.forEach(p => {
                    const serverData = data.find((d: any) => d.id === p.id)
                    state[p.id] = {
                        username: serverData?.username || "",
                        connected: serverData?.connected || false,
                        editing: false,
                        saving: false,
                    }
                })

                setPlatforms(state)
            } else {
                // Initialize empty state
                const state: PlatformState = {}
                PLATFORM_CONFIG.forEach(p => {
                    state[p.id] = { username: "", connected: false, editing: false, saving: false }
                })
                setPlatforms(state)
            }
        } catch (error) {
            console.error("Failed to fetch platforms:", error)
            // Initialize empty state on error
            const state: PlatformState = {}
            PLATFORM_CONFIG.forEach(p => {
                state[p.id] = { username: "", connected: false, editing: false, saving: false }
            })
            setPlatforms(state)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (platformId: string) => {
        const username = platforms[platformId]?.username?.trim()
        if (!username) {
            toast.error("Please enter a username")
            return
        }

        setPlatforms(prev => ({
            ...prev,
            [platformId]: { ...prev[platformId], saving: true }
        }))

        try {
            const res = await fetch("/api/me/platforms", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform: platformId, username }),
            })

            if (res.ok) {
                const platform = PLATFORM_CONFIG.find(p => p.id === platformId)
                toast.success(`Connected to ${platform?.name}!`)
                setPlatforms(prev => ({
                    ...prev,
                    [platformId]: { ...prev[platformId], connected: true, saving: false }
                }))
            } else {
                toast.error("Failed to connect")
                setPlatforms(prev => ({
                    ...prev,
                    [platformId]: { ...prev[platformId], saving: false }
                }))
            }
        } catch {
            toast.error("Failed to connect")
            setPlatforms(prev => ({
                ...prev,
                [platformId]: { ...prev[platformId], saving: false }
            }))
        }
    }

    const handleDelete = async (platformId: string) => {
        setPlatforms(prev => ({
            ...prev,
            [platformId]: { ...prev[platformId], saving: true }
        }))

        try {
            const res = await fetch("/api/me/platforms", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform: platformId, username: null }),
            })

            if (res.ok) {
                toast.success("Disconnected")
                setPlatforms(prev => ({
                    ...prev,
                    [platformId]: { username: "", connected: false, editing: false, saving: false }
                }))
            }
        } catch {
            toast.error("Failed to disconnect")
        }

        setPlatforms(prev => ({
            ...prev,
            [platformId]: { ...prev[platformId], saving: false }
        }))
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
            <CardContent className="space-y-3">
                {PLATFORM_CONFIG.map((config) => {
                    const state = platforms[config.id] || { username: "", connected: false, editing: false, saving: false }

                    return (
                        <div
                            key={config.id}
                            className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-secondary/20 transition-colors"
                        >
                            {/* Platform Icon & Name */}
                            <div className="flex items-center gap-3 min-w-[140px]">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center p-2"
                                    style={{ backgroundColor: config.color + "20" }}
                                >
                                    <Image
                                        src={config.icon}
                                        alt={config.name}
                                        width={20}
                                        height={20}
                                        className="opacity-90"
                                        style={{ filter: `drop-shadow(0 0 0 ${config.color})` }}
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-sm">{config.name}</span>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            {/* URL Input Area */}
                            <div className="flex-1 flex items-center gap-2">
                                <div className="flex-1 flex items-center rounded-lg border bg-secondary/30 overflow-hidden">
                                    <span className="px-3 py-2 text-xs text-muted-foreground bg-secondary/50 border-r whitespace-nowrap">
                                        https://{config.urlPrefix}
                                    </span>
                                    <Input
                                        value={state.username}
                                        onChange={(e) => setPlatforms(prev => ({
                                            ...prev,
                                            [config.id]: { ...prev[config.id], username: e.target.value }
                                        }))}
                                        placeholder={config.available ? "username" : "coming soon"}
                                        disabled={!config.available || state.saving}
                                        className="border-0 bg-transparent h-9 text-sm focus-visible:ring-0"
                                        onKeyDown={(e) => e.key === "Enter" && config.available && handleSubmit(config.id)}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                {state.connected ? (
                                    <>
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(config.id)}
                                            disabled={state.saving}
                                        >
                                            {state.saving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </>
                                ) : config.available ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSubmit(config.id)}
                                        disabled={state.saving || !state.username.trim()}
                                        className="h-8"
                                    >
                                        {state.saving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Submit"
                                        )}
                                    </Button>
                                ) : (
                                    <Badge variant="secondary" className="text-xs">Soon</Badge>
                                )}
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
