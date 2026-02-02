"use client"

import * as React from "react"
import { toast } from "sonner"
import { getTrailLevel, setTrailLevel, isTrailComplete } from "@/lib/easter-egg"
import { EmberTrailModal } from "@/components/features/gamification/ember-trail-modal"

interface EmberTrailContextValue {
    trailLevel: number
    triggerUnlock: () => void // Level 1 - command palette / logo clicks
    triggerProfileEmber: () => void // Level 2 - profile page ember dot
    triggerReviewEmber: () => void // Level 3 - completing a review session
}

export const EmberTrailContext = React.createContext<EmberTrailContextValue>({
    trailLevel: 0,
    triggerUnlock: () => {},
    triggerProfileEmber: () => {},
    triggerReviewEmber: () => {},
})

export function EmberTrailProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [currentLevel, setCurrentLevel] = React.useState(0)
    const [unlockedLevel, setUnlockedLevel] = React.useState<number | null>(null)

    // Load initial level on mount
    React.useEffect(() => {
        setCurrentLevel(getTrailLevel())
    }, [])

    const triggerUnlock = React.useCallback(() => {
        const level = getTrailLevel()
        if (level < 1) {
            setTrailLevel(1)
            setCurrentLevel(1)
            setUnlockedLevel(1)
            toast("Ember Node Found", {
                description: "1/3 nodes lit. The trail begins...",
            })
        }
        setOpen(true)
    }, [])

    const triggerProfileEmber = React.useCallback(() => {
        const level = getTrailLevel()
        if (level === 1) {
            setTrailLevel(2)
            setCurrentLevel(2)
            setUnlockedLevel(2)
            toast("Profile Ember Unlocked", {
                description: "2/3 nodes lit. One ember remains...",
            })
            setOpen(true)
        }
    }, [])

    const triggerReviewEmber = React.useCallback(() => {
        const level = getTrailLevel()
        if (level === 2) {
            setTrailLevel(3)
            setCurrentLevel(3)
            setUnlockedLevel(3)
            toast("Ember Trail Complete!", {
                description: "All nodes lit. स्मरणम् अभ्यासात् सिद्ध्यति",
            })
            setOpen(true)
        }
    }, [])

    return (
        <EmberTrailContext.Provider value={{
            trailLevel: currentLevel,
            triggerUnlock,
            triggerProfileEmber,
            triggerReviewEmber,
        }}>
            {children}
            <EmberTrailModal
                open={open}
                onOpenChange={setOpen}
                level={currentLevel}
                justUnlocked={unlockedLevel}
            />
        </EmberTrailContext.Provider>
    )
}

// Hook for easy consumption
export function useEmberTrail() {
    return React.useContext(EmberTrailContext)
}

// Legacy hook for backwards compatibility with EasterEggProvider
export function useEasterEgg() {
    const { triggerUnlock } = React.useContext(EmberTrailContext)
    return { triggerUnlock }
}
