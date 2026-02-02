"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useUser, useUpdateLeetCodeUsername } from "@/hooks/use-problems"
import { toast } from "sonner"
import { AvatarUpload } from "@/components/features/profile/avatar-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const { data: user, refetch: refetchUser } = useUser()

    // Username state
    const [username, setUsername] = useState("")
    const [usernameInfo, setUsernameInfo] = useState<{ canChange: boolean; daysUntilChange: number } | null>(null)
    const [savingUsername, setSavingUsername] = useState(false)

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

    return (
        <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="p-5 space-y-6">

                {/* Section 1: Avatar */}
                <div className="flex items-center gap-4">
                    <div className="shrink-0">
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
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-white/90">{session?.user?.name}</p>
                        <p className="truncate text-sm text-white/50">{session?.user?.email}</p>
                        <p className="text-xs text-white/40 mt-1">Click photo to update your avatar</p>
                    </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Section 2: Fields */}
                <div className="space-y-6">
                    <FieldRow
                        label="Display Name"
                        hint="Your name as it appears on your profile."
                    >
                        <Input
                            value={session?.user?.name || ""}
                            disabled
                            className="bg-white/[0.03] border-white/10 text-white/70 h-11"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Display name is managed by your login provider.</p>
                    </FieldRow>

                    <FieldRow
                        label="Username"
                        hint="You can change your username once every 30 days."
                    >
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="your_username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={!usernameInfo?.canChange}
                                    className="font-mono bg-white/[0.03] border-white/10 h-11"
                                />
                                <Button
                                    onClick={handleSaveUsername}
                                    disabled={savingUsername || !usernameInfo?.canChange}
                                    variant="secondary"
                                    className="h-11 px-4"
                                >
                                    {savingUsername ? "Saving..." : "Save"}
                                </Button>
                            </div>

                            {!usernameInfo?.canChange && usernameInfo?.daysUntilChange && usernameInfo.daysUntilChange > 0 && (
                                <div className="flex items-center gap-2 text-xs text-amber-500/80">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>
                                        Next change available in {usernameInfo.daysUntilChange} days
                                    </span>
                                </div>
                            )}
                        </div>
                    </FieldRow>
                </div>
            </CardContent>
        </Card>
    )

}

function FieldRow({ label, hint, children }: any) {
    return (
        <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
            <div>
                <p className="text-sm font-medium text-white/85">{label}</p>
                {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
            </div>
            <div className="min-w-0">{children}</div>
        </div>
    )
}
