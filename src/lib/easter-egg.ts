// Legacy key for backwards compatibility
export const EGG_KEY = "smarana:easterEgg:emberNode"

// New trail system key
export const TRAIL_KEY = "smarana:easterEgg:emberTrailLevel"

export function isEggUnlocked(): boolean {
    if (typeof window === "undefined") return false
    // Check legacy key or new trail level
    return localStorage.getItem(EGG_KEY) === "1" || getTrailLevel() >= 1
}

export function unlockEgg(): void {
    if (typeof window === "undefined") return
    localStorage.setItem(EGG_KEY, "1")
    // Also set trail level if not already set
    if (getTrailLevel() < 1) {
        setTrailLevel(1)
    }
}

// Trail system functions
export function getTrailLevel(): number {
    if (typeof window === "undefined") return 0
    const level = localStorage.getItem(TRAIL_KEY)
    // Check for legacy key
    if (!level && localStorage.getItem(EGG_KEY) === "1") {
        return 1
    }
    return level ? parseInt(level, 10) : 0
}

export function setTrailLevel(level: number): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TRAIL_KEY, String(level))
    // Also set legacy key for compatibility
    if (level >= 1) {
        localStorage.setItem(EGG_KEY, "1")
    }
}

export function isTrailComplete(): boolean {
    return getTrailLevel() >= 3
}
