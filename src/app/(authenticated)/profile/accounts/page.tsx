"use client"

import { useState, useEffect } from "react"
import { Lock, Download, Check, X, Eye, EyeOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AccountsPage() {
    // Password state
    const [hasPassword, setHasPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [savingPassword, setSavingPassword] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
        <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="p-5 space-y-8">

                {/* Password Section */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-base font-medium text-white/90 flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            {hasPassword ? "Change Password" : "Set Password"}
                        </h2>
                        <p className="text-xs text-white/50 mt-1">
                            {hasPassword
                                ? "Update your password to keep your account secure."
                                : "Add a password to enable email sign-in."}
                        </p>
                    </div>

                    <div className="space-y-4 max-w-md">
                        {hasPassword && (
                            <div className="space-y-2">
                                <Label className="text-white/80">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="bg-black/20 border-white/10 pr-10 h-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/50 hover:text-white"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-white/80">New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-black/20 border-white/10 pr-10 h-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/50 hover:text-white"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {newPassword && (
                            <div className="space-y-2 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                                <p className="text-xs font-medium text-white/70">Requirements:</p>
                                <div className="space-y-1">
                                    {[
                                        { label: "At least 12 characters", test: newPassword.length >= 12 },
                                        { label: "Contains uppercase letter", test: /[A-Z]/.test(newPassword) },
                                        { label: "Contains lowercase letter", test: /[a-z]/.test(newPassword) },
                                        { label: "Contains number", test: /[0-9]/.test(newPassword) },
                                        { label: "Contains special character", test: /[^A-Za-z0-9]/.test(newPassword) },
                                    ].map((rule, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            {rule.test ? (
                                                <Check className="h-3 w-3 text-emerald-500" />
                                            ) : (
                                                <div className="h-3 w-3 rounded-full border border-white/20" />
                                            )}
                                            <span className={cn(
                                                rule.test ? "text-emerald-500" : "text-white/40"
                                            )}>
                                                {rule.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-white/80">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-black/20 border-white/10 pr-10 h-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/50 hover:text-white"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {confirmPassword && (
                                <p className={cn(
                                    "text-xs flex items-center gap-1",
                                    newPassword === confirmPassword ? "text-emerald-500" : "text-rose-500"
                                )}>
                                    {newPassword === confirmPassword ? (
                                        <><Check className="h-3 w-3" /> Passwords match</>
                                    ) : (
                                        <><X className="h-3 w-3" /> Passwords do not match</>
                                    )}
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleSavePassword}
                            disabled={savingPassword}
                            className="bg-white text-black hover:bg-white/90 h-10 px-6"
                        >
                            {savingPassword ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
                        </Button>
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Data Export Section */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-base font-medium text-white/90 flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export Data
                        </h2>
                        <p className="text-xs text-white/50 mt-1">
                            Download a copy of your personal data in JSON format.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto border-white/10 hover:bg-white/5 text-white/80 h-10"
                        onClick={handleExportData}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download Archive
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}
