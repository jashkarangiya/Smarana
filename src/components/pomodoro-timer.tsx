"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Timer, Settings, Volume2, VolumeX, Maximize2, Minimize2, GripHorizontal, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

type TimerPhase = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK"

interface TimerSettings {
    focusDuration: number
    shortBreakDuration: number
    longBreakDuration: number
    longBreakInterval: number
    autoStartBreaks: boolean
    autoStartPomodoros: boolean
}

// Default settings if API fails
const DEFAULT_SETTINGS: TimerSettings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false
}

export function PomodoroTimer() {
    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const [phase, setPhase] = useState<TimerPhase>("FOCUS")
    const [cycles, setCycles] = useState(0)

    // Engine State (Timestamp based)
    const endTimeRef = useRef<number | null>(null)
    const rafRef = useRef<number | null>(null)

    // Settings State
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [loadingSettings, setLoadingSettings] = useState(false)

    // Floating State
    const [isFloating, setIsFloating] = useState(false)
    const [position, setPosition] = useState({ x: 20, y: 100 })
    const [isDragging, setIsDragging] = useState(false)
    const dragRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 })

    // Load Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/me/pomodoro-settings")
                if (res.ok) {
                    const data = await res.json()
                    setSettings(data)
                    // Only update time if timer is not running
                    if (!isActive) {
                        setTimeLeft(data.focusDuration * 60)
                    }
                }
            } catch (error) {
                console.error("Failed to load settings", error)
            }
        }
        fetchSettings()
    }, [])

    // Timer Engine
    useEffect(() => {
        if (isActive && endTimeRef.current) {
            const tick = () => {
                const now = Date.now()
                const remaining = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000))

                setTimeLeft(remaining)

                if (remaining <= 0) {
                    handleTimerComplete()
                } else {
                    rafRef.current = requestAnimationFrame(tick)
                }
            }
            rafRef.current = requestAnimationFrame(tick)
        }

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [isActive])

    const handleTimerComplete = () => {
        setIsActive(false)
        endTimeRef.current = null
        playNotificationSound()

        if (phase === "FOCUS") {
            const newCycles = cycles + 1
            setCycles(newCycles)

            const isLongBreak = newCycles % settings.longBreakInterval === 0
            if (isLongBreak) {
                setPhase("LONG_BREAK")
                setTimeLeft(settings.longBreakDuration * 60)
                toast.success("Focus complete! Enjoy a long break.")
                if (settings.autoStartBreaks) startTimer(settings.longBreakDuration * 60)
            } else {
                setPhase("SHORT_BREAK")
                setTimeLeft(settings.shortBreakDuration * 60)
                toast.success("Focus complete! Time for a short break.")
                if (settings.autoStartBreaks) startTimer(settings.shortBreakDuration * 60)
            }
        } else {
            // Break is over
            setPhase("FOCUS")
            setTimeLeft(settings.focusDuration * 60)
            toast.info("Break over. Ready to focus?")
            if (settings.autoStartPomodoros) startTimer(settings.focusDuration * 60)
        }
    }

    const startTimer = (durationSeconds?: number) => {
        const duration = durationSeconds || timeLeft
        const now = Date.now()
        endTimeRef.current = now + (duration * 1000)
        setIsActive(true)

        // Auto float on start
        if (!isFloating) setIsFloating(true)
    }

    const pauseTimer = () => {
        setIsActive(false)
        endTimeRef.current = null
    }

    const resetTimer = () => {
        setIsActive(false)
        endTimeRef.current = null
        setPhase("FOCUS")
        setCycles(0)
        setTimeLeft(settings.focusDuration * 60)
    }

    const playNotificationSound = () => {
        if (!soundEnabled) return
        try {
            // Simple beep using AudioContext if file missing, or just a log for now
            // const audio = new Audio("/sounds/bell.mp3") 
            // audio.play().catch(e => console.log("Audio play failed", e))
            console.log("DING!")
        } catch (e) { }
    }

    const saveSettings = async (newSettings: TimerSettings) => {
        setLoadingSettings(true)
        try {
            const res = await fetch("/api/me/pomodoro-settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSettings)
            })
            if (!res.ok) throw new Error("Failed to save")

            setSettings(newSettings)

            // If timer not running, apply immediately
            if (!isActive) {
                if (phase === "FOCUS") setTimeLeft(newSettings.focusDuration * 60)
                if (phase === "SHORT_BREAK") setTimeLeft(newSettings.shortBreakDuration * 60)
                if (phase === "LONG_BREAK") setTimeLeft(newSettings.longBreakDuration * 60)
            }

            setSettingsOpen(false)
            toast.success("Settings saved")
        } catch (e) {
            toast.error("Failed to save settings")
        } finally {
            setLoadingSettings(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const getProgress = () => {
        let total = 0
        if (phase === "FOCUS") total = settings.focusDuration * 60
        else if (phase === "SHORT_BREAK") total = settings.shortBreakDuration * 60
        else total = settings.longBreakDuration * 60

        return ((total - timeLeft) / total) * 100
    }

    const getPhaseLabel = () => {
        if (phase === "FOCUS") return "Focus Time"
        if (phase === "SHORT_BREAK") return "Short Break"
        return "Long Break"
    }

    // Drag Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        dragRef.current = {
            offsetX: e.clientX - position.x,
            offsetY: e.clientY - position.y,
        }
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: Math.max(0, Math.min(window.innerWidth - 220, e.clientX - dragRef.current.offsetX)),
                    y: Math.max(0, Math.min(window.innerHeight - 300, e.clientY - dragRef.current.offsetY)),
                })
            }
        }
        const handleMouseUp = () => setIsDragging(false)

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDragging])


    // Floating Widget
    if (isFloating) {
        return (
            <>
                {/* Placeholder in sidebar */}
                <Card className="opacity-50 border-dashed">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Timer className="h-4 w-4 text-primary" />
                            Pomodoro
                            <span className="ml-auto text-xs font-normal text-muted-foreground">Floating</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setIsFloating(false)}
                        >
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Dock to Sidebar
                        </Button>
                    </CardContent>
                </Card>

                <div
                    className="fixed z-[100] select-none shadow-2xl rounded-2xl overflow-hidden bg-card/95 backdrop-blur-xl border border-border/50 min-w-[240px]"
                    style={{ left: position.x, top: position.y }}
                >
                    {/* Drag Handle */}
                    <div
                        className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-move border-b border-border/30"
                        onMouseDown={handleMouseDown}
                    >
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                            {getPhaseLabel()}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFloating(false)}>
                                <Minimize2 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:text-destructive" onClick={() => { setIsFloating(false); setIsActive(false); }}>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Floating Content */}
                    <div className="p-5 flex flex-col items-center gap-3">
                        <div className="relative">
                            <div className="text-4xl font-bold tabular-nums tracking-wider text-center">
                                {formatTime(timeLeft)}
                            </div>
                            <Progress value={getProgress()} className={`h-1.5 w-32 mt-2 ${phase !== "FOCUS" ? "bg-emerald-500/20 [&>div]:bg-emerald-500" : ""}`} />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant={isActive ? "outline" : "default"}
                                size="sm"
                                className="h-9 px-4 rounded-full"
                                onClick={() => isActive ? pauseTimer() : startTimer()}
                            >
                                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-1" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 rounded-full px-0"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // Default View
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
                    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
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
                                            value={settings.focusDuration}
                                            onChange={(e) => setSettings({ ...settings, focusDuration: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Short Break (min)</Label>
                                        <Input
                                            type="number"
                                            value={settings.shortBreakDuration}
                                            onChange={(e) => setSettings({ ...settings, shortBreakDuration: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Long Break (min)</Label>
                                        <Input
                                            type="number"
                                            value={settings.longBreakDuration}
                                            onChange={(e) => setSettings({ ...settings, longBreakDuration: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Long Break Interval</Label>
                                        <Input
                                            type="number"
                                            value={settings.longBreakInterval}
                                            onChange={(e) => setSettings({ ...settings, longBreakInterval: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Auto-start Breaks</Label>
                                        <Switch
                                            checked={settings.autoStartBreaks}
                                            onCheckedChange={(c) => setSettings({ ...settings, autoStartBreaks: c })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Auto-start Pomodoros</Label>
                                        <Switch
                                            checked={settings.autoStartPomodoros}
                                            onCheckedChange={(c) => setSettings({ ...settings, autoStartPomodoros: c })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" onClick={() => setSettings({ ...settings, focusDuration: 25, shortBreakDuration: 5, longBreakDuration: 15 })} className="flex-1">
                                        Classic (25/5)
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setSettings({ ...settings, focusDuration: 50, shortBreakDuration: 10, longBreakDuration: 20 })} className="flex-1">
                                        Deep Work (50/10)
                                    </Button>
                                </div>
                                <Button onClick={() => saveSettings(settings)} disabled={loadingSettings}>
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
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => setIsFloating(true)}
                        title="Pop out"
                    >
                        <Maximize2 className="h-5 w-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
