"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
    Play,
    Pause,
    RotateCcw,
    Timer,
    Settings,
    Volume2,
    VolumeX,
    Coffee,
    Brain,
} from "lucide-react"
import { usePomodoro } from "@/hooks/use-pomodoro"

export function PomodoroSheet({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
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

    const getPhaseIcon = () => {
        if (phase === "FOCUS") return <Brain className="h-5 w-5" />
        return <Coffee className="h-5 w-5" />
    }

    const getPhaseColor = () => {
        if (phase === "FOCUS") return "text-amber-400"
        return "text-emerald-400"
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-[340px] sm:w-[400px] p-0 border-white/10"
                style={{
                    background: "rgba(12,12,12,0.95)",
                    backdropFilter: "blur(20px)",
                }}
            >
                <SheetHeader className="p-6 pb-4 border-b border-white/10">
                    <SheetTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Timer className="h-5 w-5 text-amber-400" />
                            <span>Pomodoro Timer</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-white/10"
                                onClick={() => setSoundEnabled(!soundEnabled)}
                            >
                                {soundEnabled ? (
                                    <Volume2 className="h-4 w-4" />
                                ) : (
                                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                            <Dialog open={settingsOpen} onOpenChange={handleSettingsOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg hover:bg-white/10"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#0c0c0c]/95 border-white/10">
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
                                                    onChange={(e) =>
                                                        setLocalSettings({
                                                            ...localSettings,
                                                            focusDuration: Number(e.target.value),
                                                        })
                                                    }
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Short Break (min)</Label>
                                                <Input
                                                    type="number"
                                                    value={localSettings.shortBreakDuration}
                                                    onChange={(e) =>
                                                        setLocalSettings({
                                                            ...localSettings,
                                                            shortBreakDuration: Number(e.target.value),
                                                        })
                                                    }
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Long Break (min)</Label>
                                                <Input
                                                    type="number"
                                                    value={localSettings.longBreakDuration}
                                                    onChange={(e) =>
                                                        setLocalSettings({
                                                            ...localSettings,
                                                            longBreakDuration: Number(e.target.value),
                                                        })
                                                    }
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Long Break Interval</Label>
                                                <Input
                                                    type="number"
                                                    value={localSettings.longBreakInterval}
                                                    onChange={(e) =>
                                                        setLocalSettings({
                                                            ...localSettings,
                                                            longBreakInterval: Number(e.target.value),
                                                        })
                                                    }
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Auto-start Breaks</Label>
                                                <Switch
                                                    checked={localSettings.autoStartBreaks}
                                                    onCheckedChange={(c) =>
                                                        setLocalSettings({ ...localSettings, autoStartBreaks: c })
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label>Auto-start Pomodoros</Label>
                                                <Switch
                                                    checked={localSettings.autoStartPomodoros}
                                                    onCheckedChange={(c) =>
                                                        setLocalSettings({ ...localSettings, autoStartPomodoros: c })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setLocalSettings({
                                                        ...localSettings,
                                                        focusDuration: 25,
                                                        shortBreakDuration: 5,
                                                        longBreakDuration: 15,
                                                    })
                                                }
                                                className="flex-1 border-white/10 hover:bg-white/5"
                                            >
                                                Classic (25/5)
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setLocalSettings({
                                                        ...localSettings,
                                                        focusDuration: 50,
                                                        shortBreakDuration: 10,
                                                        longBreakDuration: 20,
                                                    })
                                                }
                                                className="flex-1 border-white/10 hover:bg-white/5"
                                            >
                                                Deep Work (50/10)
                                            </Button>
                                        </div>
                                        <Button
                                            onClick={handleSaveSettings}
                                            disabled={loadingSettings}
                                            className="bg-amber-500 hover:bg-amber-600 text-black"
                                        >
                                            {loadingSettings ? "Saving..." : "Save Settings"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="p-6 space-y-8">
                    {/* Phase indicator */}
                    <div className="flex justify-center">
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 ${getPhaseColor()}`}
                        >
                            {getPhaseIcon()}
                            <span className="font-medium">{getPhaseLabel()}</span>
                        </div>
                    </div>

                    {/* Cycle indicators */}
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-8 rounded-full transition-colors ${
                                    i < cycles % settings.longBreakInterval
                                        ? "bg-amber-400"
                                        : "bg-white/10"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Timer display */}
                    <div className="text-center">
                        <div className="text-7xl font-bold font-mono tracking-wider tabular-nums text-white">
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <Progress
                        value={getProgress()}
                        className={`h-2 ${
                            phase !== "FOCUS"
                                ? "bg-emerald-500/20 [&>div]:bg-emerald-500"
                                : "bg-amber-500/20 [&>div]:bg-amber-500"
                        }`}
                    />

                    {/* Controls */}
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-14 w-14 rounded-full text-muted-foreground hover:text-white hover:bg-white/10"
                            onClick={resetTimer}
                        >
                            <RotateCcw className="h-6 w-6" />
                        </Button>
                        <Button
                            size="icon"
                            className={`h-16 w-16 rounded-full ${
                                isActive
                                    ? "bg-white/10 hover:bg-white/20 text-white"
                                    : "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                            }`}
                            onClick={() => (isActive ? pauseTimer() : startTimer())}
                        >
                            {isActive ? (
                                <Pause className="h-7 w-7" />
                            ) : (
                                <Play className="h-7 w-7 ml-1" />
                            )}
                        </Button>
                        <div className="w-14" /> {/* Spacer for symmetry */}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                            <p className="text-2xl font-bold text-white">{cycles}</p>
                            <p className="text-xs text-muted-foreground">Pomodoros Today</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                            <p className="text-2xl font-bold text-white">
                                {Math.floor((cycles * settings.focusDuration) / 60)}h{" "}
                                {(cycles * settings.focusDuration) % 60}m
                            </p>
                            <p className="text-xs text-muted-foreground">Focus Time</p>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
