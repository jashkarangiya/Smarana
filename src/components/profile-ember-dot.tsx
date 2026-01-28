"use client"

import * as React from "react"
import { useEmberTrail } from "./ember-trail-provider"

export function ProfileEmberDot() {
    const { trailLevel, triggerProfileEmber } = useEmberTrail()
    const clicks = React.useRef(0)
    const timer = React.useRef<number | null>(null)

    // Only show if level 1 is unlocked (first easter egg found)
    if (trailLevel < 1) {
        return null
    }

    // Already unlocked level 2, show static dot
    if (trailLevel >= 2) {
        return (
            <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#BB7331]"
                style={{ boxShadow: "0 0 8px rgba(187,115,49,0.6)" }}
            />
        )
    }

    const handleClick = () => {
        clicks.current += 1

        // Reset timer window
        if (timer.current) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => {
            clicks.current = 0
        }, 1800)

        if (clicks.current >= 3) {
            clicks.current = 0
            triggerProfileEmber()
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#BB7331]/60 hover:bg-[#BB7331] transition-colors cursor-pointer"
            style={{ boxShadow: "0 0 6px rgba(187,115,49,0.3)" }}
            aria-label="Ember dot"
        />
    )
}
