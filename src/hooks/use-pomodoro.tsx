"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react"
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

const DEFAULT_SETTINGS: TimerSettings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
}

const STORAGE_KEY = "pomodoro-timer-state"

interface TimerState {
    endsAt: number | null
    phase: TimerPhase
    cycles: number
    isRunning: boolean
    timeLeft: number
}

interface PomodoroContextType {
    // State
    timeLeft: number
    isActive: boolean
    phase: TimerPhase
    cycles: number
    settings: TimerSettings
    soundEnabled: boolean

    // Actions
    startTimer: (durationSeconds?: number) => void
    pauseTimer: () => void
    resetTimer: () => void
    setSoundEnabled: (enabled: boolean) => void
    saveSettings: (newSettings: TimerSettings) => Promise<void>
    setSettings: (settings: TimerSettings) => void

    // Helpers
    formatTime: (seconds: number) => string
    getProgress: () => number
    getPhaseLabel: () => string
}

const PomodoroContext = createContext<PomodoroContextType | null>(null)

export function PomodoroProvider({ children }: { children: ReactNode }) {
    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const [phase, setPhase] = useState<TimerPhase>("FOCUS")
    const [cycles, setCycles] = useState(0)

    // Settings
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [settingsLoaded, setSettingsLoaded] = useState(false)

    // Refs for timestamp-based timing
    const endsAtRef = useRef<number | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Load persisted state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const state: TimerState = JSON.parse(saved)
                setPhase(state.phase)
                setCycles(state.cycles)

                if (state.endsAt && state.isRunning) {
                    const remaining = Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000))
                    if (remaining > 0) {
                        endsAtRef.current = state.endsAt
                        setTimeLeft(remaining)
                        setIsActive(true)
                    } else {
                        setTimeLeft(state.timeLeft || settings.focusDuration * 60)
                    }
                } else {
                    setTimeLeft(state.timeLeft || settings.focusDuration * 60)
                }
            } catch (e) {
                console.error("Failed to parse timer state", e)
            }
        }
    }, [])

    // Load settings from API
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/me/pomodoro-settings")
                if (res.ok) {
                    const data = await res.json()
                    setSettings(data)
                    if (!isActive && !localStorage.getItem(STORAGE_KEY)) {
                        setTimeLeft(data.focusDuration * 60)
                    }
                    setSettingsLoaded(true)
                }
            } catch (error) {
                console.error("Failed to load settings", error)
                setSettingsLoaded(true)
            }
        }
        fetchSettings()
    }, [])

    // Persist state to localStorage
    const persistState = useCallback(() => {
        const state: TimerState = {
            endsAt: endsAtRef.current,
            phase,
            cycles,
            isRunning: isActive,
            timeLeft,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }, [phase, cycles, isActive, timeLeft])

    useEffect(() => {
        persistState()
    }, [phase, cycles, isActive, timeLeft, persistState])

    const playNotificationSound = useCallback(() => {
        if (!soundEnabled) return
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = 800
            oscillator.type = "sine"
            gainNode.gain.value = 0.3

            oscillator.start()
            oscillator.stop(audioContext.currentTime + 0.2)
        } catch (e) {
            console.log("Audio play failed", e)
        }
    }, [soundEnabled])

    const handleTimerComplete = useCallback(() => {
        setIsActive(false)
        endsAtRef.current = null
        playNotificationSound()

        if (phase === "FOCUS") {
            const newCycles = cycles + 1
            setCycles(newCycles)

            const isLongBreak = newCycles % settings.longBreakInterval === 0
            if (isLongBreak) {
                setPhase("LONG_BREAK")
                setTimeLeft(settings.longBreakDuration * 60)
                toast.success("Focus complete! Enjoy a long break.", { duration: 5000 })
                if (settings.autoStartBreaks) {
                    setTimeout(() => {
                        endsAtRef.current = Date.now() + settings.longBreakDuration * 60 * 1000
                        setIsActive(true)
                    }, 100)
                }
            } else {
                setPhase("SHORT_BREAK")
                setTimeLeft(settings.shortBreakDuration * 60)
                toast.success("Focus complete! Time for a short break.", { duration: 5000 })
                if (settings.autoStartBreaks) {
                    setTimeout(() => {
                        endsAtRef.current = Date.now() + settings.shortBreakDuration * 60 * 1000
                        setIsActive(true)
                    }, 100)
                }
            }
        } else {
            setPhase("FOCUS")
            setTimeLeft(settings.focusDuration * 60)
            toast.info("Break over. Ready to focus?", { duration: 5000 })
            if (settings.autoStartPomodoros) {
                setTimeout(() => {
                    endsAtRef.current = Date.now() + settings.focusDuration * 60 * 1000
                    setIsActive(true)
                }, 100)
            }
        }
    }, [phase, cycles, settings, playNotificationSound])

    // Timer tick using timestamps (drift-free)
    useEffect(() => {
        if (isActive && endsAtRef.current) {
            intervalRef.current = setInterval(() => {
                const now = Date.now()
                const remaining = Math.max(0, Math.ceil((endsAtRef.current! - now) / 1000))
                setTimeLeft(remaining)

                if (remaining <= 0) {
                    handleTimerComplete()
                }
            }, 100)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isActive, handleTimerComplete])

    const startTimer = useCallback((durationSeconds?: number) => {
        const duration = durationSeconds || timeLeft
        endsAtRef.current = Date.now() + duration * 1000
        setIsActive(true)
    }, [timeLeft])

    const pauseTimer = useCallback(() => {
        if (endsAtRef.current) {
            const remaining = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000))
            setTimeLeft(remaining)
        }
        setIsActive(false)
        endsAtRef.current = null
    }, [])

    const resetTimer = useCallback(() => {
        setIsActive(false)
        endsAtRef.current = null
        setPhase("FOCUS")
        setCycles(0)
        setTimeLeft(settings.focusDuration * 60)
    }, [settings.focusDuration])

    const saveSettings = useCallback(async (newSettings: TimerSettings) => {
        try {
            const res = await fetch("/api/me/pomodoro-settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSettings),
            })
            if (!res.ok) throw new Error("Failed to save")

            setSettings(newSettings)

            if (!isActive) {
                if (phase === "FOCUS") setTimeLeft(newSettings.focusDuration * 60)
                if (phase === "SHORT_BREAK") setTimeLeft(newSettings.shortBreakDuration * 60)
                if (phase === "LONG_BREAK") setTimeLeft(newSettings.longBreakDuration * 60)
            }

            toast.success("Settings saved")
        } catch (e) {
            toast.error("Failed to save settings")
            throw e
        }
    }, [isActive, phase])

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }, [])

    const getProgress = useCallback(() => {
        let total = 0
        if (phase === "FOCUS") total = settings.focusDuration * 60
        else if (phase === "SHORT_BREAK") total = settings.shortBreakDuration * 60
        else total = settings.longBreakDuration * 60

        return ((total - timeLeft) / total) * 100
    }, [phase, settings, timeLeft])

    const getPhaseLabel = useCallback(() => {
        if (phase === "FOCUS") return "Focus Time"
        if (phase === "SHORT_BREAK") return "Short Break"
        return "Long Break"
    }, [phase])

    return (
        <PomodoroContext.Provider
            value={{
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
                setSettings,
                formatTime,
                getProgress,
                getPhaseLabel,
            }}
        >
            {children}
        </PomodoroContext.Provider>
    )
}

export function usePomodoro() {
    const context = useContext(PomodoroContext)
    if (!context) {
        throw new Error("usePomodoro must be used within a PomodoroProvider")
    }
    return context
}
