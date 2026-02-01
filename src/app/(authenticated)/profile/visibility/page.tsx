"use client"

import { useState, useEffect } from "react"
import { Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function VisibilityPage() {
    // Privacy settings state
    const [profileVisibility, setProfileVisibility] = useState<"PUBLIC" | "FRIENDS_ONLY" | "PRIVATE">("PUBLIC")
    const [showStreakToPublic, setShowStreakToPublic] = useState(true)
    const [showStreakToFriends, setShowStreakToFriends] = useState(true)
    const [showPlatformsToPublic, setShowPlatformsToPublic] = useState(true)
    const [showPlatformsToFriends, setShowPlatformsToFriends] = useState(true)
    const [savingPrivacy, setSavingPrivacy] = useState(false)

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

    return (
        <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="p-5 space-y-8">
                {/* Profile Visibility */}
                <div className="space-y-4">
                    <Label className="text-base text-white/90">Profile Visibility</Label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors">
                            <input
                                type="radio"
                                name="profileVisibility"
                                checked={profileVisibility === "PUBLIC"}
                                onChange={() => setProfileVisibility("PUBLIC")}
                                className="w-4 h-4 accent-[#BB7331]"
                            />
                            <div>
                                <p className="font-medium text-white/90">Public</p>
                                <p className="text-xs text-white/50">Anyone can view your profile</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors">
                            <input
                                type="radio"
                                name="profileVisibility"
                                checked={profileVisibility === "FRIENDS_ONLY"}
                                onChange={() => setProfileVisibility("FRIENDS_ONLY")}
                                className="w-4 h-4 accent-[#BB7331]"
                            />
                            <div>
                                <p className="font-medium text-white/90">Friends Only</p>
                                <p className="text-xs text-white/50">Only friends can view your profile</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors">
                            <input
                                type="radio"
                                name="profileVisibility"
                                checked={profileVisibility === "PRIVATE"}
                                onChange={() => setProfileVisibility("PRIVATE")}
                                className="w-4 h-4 accent-[#BB7331]"
                            />
                            <div>
                                <p className="font-medium text-white/90">Private</p>
                                <p className="text-xs text-white/50">Only you can view your profile</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Streak Visibility */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <Label className="text-base text-white/90">Streak Visibility</Label>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-1">
                            <div className="space-y-0.5">
                                <Label className="text-white/80">Show streak to public</Label>
                                <p className="text-xs text-white/50">Anyone can see your streak stats</p>
                            </div>
                            <Switch
                                checked={showStreakToPublic}
                                onCheckedChange={setShowStreakToPublic}
                            />
                        </div>
                        <div className="flex items-center justify-between p-1">
                            <div className="space-y-0.5">
                                <Label className="text-white/80">Show streak to friends</Label>
                                <p className="text-xs text-white/50">Friends can see your streak stats</p>
                            </div>
                            <Switch
                                checked={showStreakToFriends}
                                onCheckedChange={setShowStreakToFriends}
                            />
                        </div>
                    </div>
                </div>

                {/* Platform Visibility */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <Label className="text-base text-white/90">Platform Visibility</Label>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-1">
                            <div className="space-y-0.5">
                                <Label className="text-white/80">Show platforms to public</Label>
                                <p className="text-xs text-white/50">Anyone can see your linked accounts</p>
                            </div>
                            <Switch
                                checked={showPlatformsToPublic}
                                onCheckedChange={setShowPlatformsToPublic}
                            />
                        </div>
                        <div className="flex items-center justify-between p-1">
                            <div className="space-y-0.5">
                                <Label className="text-white/80">Show platforms to friends</Label>
                                <p className="text-xs text-white/50">Friends can see your linked accounts</p>
                            </div>
                            <Switch
                                checked={showPlatformsToFriends}
                                onCheckedChange={setShowPlatformsToFriends}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        onClick={handleSavePrivacy}
                        disabled={savingPrivacy}
                        className="bg-white text-black hover:bg-white/90 h-10 px-6"
                    >
                        {savingPrivacy ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
