"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Coffee, Brain, Timer, X, Minimize2, Maximize2, GripHorizontal } from "lucide-react"

type TimerMode = "work" | "shortBreak" | "longBreak"

const TIMER_CONFIG = {
    work: { duration: 25 * 60, label: "Focus", icon: Brain, color: "text-primary" },
    shortBreak: { duration: 5 * 60, label: "Short Break", icon: Coffee, color: "text-emerald-500" },
    longBreak: { duration: 15 * 60, label: "Long Break", icon: Coffee, color: "text-blue-500" },
}

export function PomodoroTimer() {
    const [mode, setMode] = useState<TimerMode>("work")
    const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.work.duration)
    const [isRunning, setIsRunning] = useState(false)
    const [sessions, setSessions] = useState(0)
    const [isFloating, setIsFloating] = useState(false)
    const [position, setPosition] = useState({ x: 20, y: 100 })
    const [isDragging, setIsDragging] = useState(false)
    const dragRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 })

    const config = TIMER_CONFIG[mode]
    const Icon = config.icon

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const progress = ((TIMER_CONFIG[mode].duration - timeLeft) / TIMER_CONFIG[mode].duration) * 100

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode)
        setTimeLeft(TIMER_CONFIG[newMode].duration)
        setIsRunning(false)
    }, [])

    const handleComplete = useCallback(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
                new Notification("Pomodoro Timer", {
                    body: mode === "work" ? "Time for a break!" : "Ready to focus?",
                    icon: "/favicon.ico",
                })
            }
        }

        if (mode === "work") {
            const newSessions = sessions + 1
            setSessions(newSessions)
            if (newSessions % 4 === 0) {
                switchMode("longBreak")
            } else {
                switchMode("shortBreak")
            }
        } else {
            switchMode("work")
        }
    }, [mode, sessions, switchMode])

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            handleComplete()
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isRunning, timeLeft, handleComplete])

    const toggleTimer = () => setIsRunning(!isRunning)
    const resetTimer = () => {
        setTimeLeft(TIMER_CONFIG[mode].duration)
        setIsRunning(false)
    }

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission()
            }
        }
    }, [])

    // Dragging logic
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
                    x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragRef.current.offsetX)),
                    y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragRef.current.offsetY)),
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

    // Pop out when timer starts
    useEffect(() => {
        if (isRunning && !isFloating) {
            setIsFloating(true)
        }
    }, [isRunning, isFloating])

    // Floating mini widget
    if (isFloating) {
        return (
            <>
                {/* Placeholder in sidebar */}
                <Card className="opacity-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Timer className="h-4 w-4 text-primary" />
                            Pomodoro Timer
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
                            Show Here
                        </Button>
                    </CardContent>
                </Card>

                {/* Floating Widget */}
                <div
                    className="fixed z-[100] select-none"
                    style={{ left: position.x, top: position.y }}
                >
                    <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden min-w-[220px]">
                        {/* Drag Handle */}
                        <div
                            className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-move border-b border-border/30"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="flex items-center gap-2">
                                <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium">{config.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => setIsFloating(false)}
                                >
                                    <Minimize2 className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full text-destructive hover:text-destructive"
                                    onClick={() => {
                                        setIsFloating(false)
                                        setIsRunning(false)
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Timer Content */}
                        <div className="p-4 flex items-center gap-4">
                            {/* Progress Ring */}
                            <div className="relative">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        className="text-muted/30"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 28}`}
                                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                                        className={`${config.color} transition-all duration-1000`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Icon className={`h-5 w-5 ${config.color}`} />
                                </div>
                            </div>

                            {/* Time and Controls */}
                            <div className="flex-1">
                                <div className="text-2xl font-bold tabular-nums">
                                    {formatTime(timeLeft)}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={resetTimer}
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        className={`h-8 px-4 rounded-full ${isRunning ? "bg-muted hover:bg-muted/80 text-foreground" : ""}`}
                                        onClick={toggleTimer}
                                    >
                                        {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Session dots */}
                        <div className="flex justify-center gap-1 pb-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 w-1.5 rounded-full ${i <= (sessions % 4 || (sessions > 0 ? 4 : 0))
                                            ? "bg-primary"
                                            : "bg-muted"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // Normal embedded view
    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    Pomodoro Timer
                    {sessions > 0 && (
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                            {sessions} session{sessions !== 1 ? "s" : ""}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mode Selector */}
                <div className="flex gap-1 p-1 bg-muted/50 rounded-full">
                    {(Object.keys(TIMER_CONFIG) as TimerMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-full transition-all ${mode === m
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {TIMER_CONFIG[m].label}
                        </button>
                    ))}
                </div>

                {/* Timer Display */}
                <div className="relative flex flex-col items-center py-6">
                    <div className="relative">
                        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                            <circle
                                cx="72"
                                cy="72"
                                r="64"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                className="text-muted/30"
                            />
                            <circle
                                cx="72"
                                cy="72"
                                r="64"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 64}`}
                                strokeDashoffset={`${2 * Math.PI * 64 * (1 - progress / 100)}`}
                                className={`${config.color} transition-all duration-1000`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Icon className={`h-5 w-5 mb-1 ${config.color}`} />
                            <span className="text-3xl font-bold tabular-nums">
                                {formatTime(timeLeft)}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5">
                                {config.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={resetTimer}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        size="lg"
                        className={`h-12 w-24 rounded-full font-semibold ${isRunning ? "bg-muted hover:bg-muted/80 text-foreground" : ""
                            }`}
                        onClick={toggleTimer}
                    >
                        {isRunning ? (
                            <>
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-1" />
                                Start
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={() => setIsFloating(true)}
                        title="Pop out"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Session indicators */}
                <div className="flex items-center justify-center gap-1.5 pt-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`h-2 w-2 rounded-full transition-colors ${i <= (sessions % 4 || (sessions > 0 ? 4 : 0))
                                    ? "bg-primary"
                                    : "bg-muted"
                                }`}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
