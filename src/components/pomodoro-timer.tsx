"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Timer, Settings, Volume2, VolumeX, Maximize2, Minimize2, GripHorizontal, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { usePomodoro } from "@/hooks/use-pomodoro"

export function PomodoroTimer() {
    const {
        timeLeft,
        isActive,
        phase,
        cycles,
        settings,
        soundEnabled,
        startTimer,
        pauseTimer,
        resetTimer,
        setSoundEnabled,
        saveSettings,
        formatTime,
        getProgress,
        getPhaseLabel,
    } = usePomodoro()

    const [settingsOpen, setSettingsOpen] = useState(false)
    const [loadingSettings, setLoadingSettings] = useState(false)
    const [localSettings, setLocalSettings] = useState(settings)

    // Sync local settings when dialog opens
    const handleSettingsOpen = (open: boolean) => {
        if (open) {
            setLocalSettings(settings)
        }
        setSettingsOpen(open)
    }

    const handleSaveSettings = async () => {
        setLoadingSettings(true)
        try {
            await saveSettings(localSettings)
            setSettingsOpen(false)
        } catch (e) {
            // Error handled in saveSettings
        } finally {
            setLoadingSettings(false)
        }
    }

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    Pomodoro
                </CardTitle>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSoundEnabled(!soundEnabled)}>
                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Dialog open={settingsOpen} onOpenChange={handleSettingsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Timer Settings</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Focus (min)</Label>
                                        <Input
                                            type="number"
                                            value={localSettings.focusDuration}
                                            onChange={(e) => setLocalSettings({ ...localSettings, focusDuration: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Short Break (min)</Label>
                                        <Input
                                            type="number"
                                            value={localSettings.shortBreakDuration}
                                            onChange={(e) => setLocalSettings({ ...localSettings, shortBreakDuration: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Long Break (min)</Label>
                                        <Input
                                            type="number"
                                            value={localSettings.longBreakDuration}
                                            onChange={(e) => setLocalSettings({ ...localSettings, longBreakDuration: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Long Break Interval</Label>
                                        <Input
                                            type="number"
                                            value={localSettings.longBreakInterval}
                                            onChange={(e) => setLocalSettings({ ...localSettings, longBreakInterval: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Auto-start Breaks</Label>
                                        <Switch
                                            checked={localSettings.autoStartBreaks}
                                            onCheckedChange={(c) => setLocalSettings({ ...localSettings, autoStartBreaks: c })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Auto-start Pomodoros</Label>
                                        <Switch
                                            checked={localSettings.autoStartPomodoros}
                                            onCheckedChange={(c) => setLocalSettings({ ...localSettings, autoStartPomodoros: c })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" onClick={() => setLocalSettings({ ...localSettings, focusDuration: 25, shortBreakDuration: 5, longBreakDuration: 15 })} className="flex-1">
                                        Classic (25/5)
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setLocalSettings({ ...localSettings, focusDuration: 50, shortBreakDuration: 10, longBreakDuration: 20 })} className="flex-1">
                                        Deep Work (50/10)
                                    </Button>
                                </div>
                                <Button onClick={handleSaveSettings} disabled={loadingSettings}>
                                    {loadingSettings ? "Saving..." : "Save Settings"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-center py-4">
                    <div className="mb-2 flex justify-center gap-2">
                        {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 w-6 rounded-full transition-colors ${i < (cycles % settings.longBreakInterval) ? "bg-primary" : "bg-secondary"
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="text-5xl font-bold font-mono tracking-wider tabular-nums">
                        {formatTime(timeLeft)}
                    </div>
                    <p className={`text-sm font-medium mt-2 ${phase !== "FOCUS" ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {getPhaseLabel()}
                    </p>
                </div>

                <Progress value={getProgress()} className={`h-2 mb-6 ${phase !== "FOCUS" ? "bg-emerald-500/20 [&>div]:bg-emerald-500" : ""}`} />

                <div className="flex justify-center gap-3">
                    <Button
                        variant={isActive ? "outline" : "default"}
                        size="icon"
                        className={`h-12 w-12 rounded-full ${isActive ? "" : "shadow-[0_0_15px_rgba(234,179,8,0.3)]"}`}
                        onClick={() => isActive ? pauseTimer() : startTimer()}
                    >
                        {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={resetTimer}
                    >
                        <RotateCcw className="h-5 w-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
