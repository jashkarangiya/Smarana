"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface EmberTrailModalProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    level: number
    justUnlocked: number | null
}

const LEVEL_DATA = {
    1: {
        title: "Ember Node Found",
        subtitle: "स्मरण — the art of remembering.",
        subtitleTranslation: "",
        hint: "The next ember is closer than you think — check your profile.",
        progress: "1/3 nodes lit",
    },
    2: {
        title: "Profile Ember Unlocked",
        subtitle: "You noticed the hidden ember.",
        subtitleTranslation: "",
        hint: "One ember remains. Complete a review session to finish the trail.",
        progress: "2/3 nodes lit",
    },
    3: {
        title: "Ember Trail Complete",
        subtitle: "स्मरणम् अभ्यासात् सिद्ध्यति",
        subtitleTranslation: "Remembrance is perfected by practice.",
        hint: "You've found all the embers. Keep the flame alive.",
        progress: "3/3 nodes lit",
    },
}

export function EmberTrailModal({ open, onOpenChange, level, justUnlocked }: EmberTrailModalProps) {
    // Check for reduced motion preference
    const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    const displayLevel = Math.max(1, Math.min(3, level)) as 1 | 2 | 3
    const data = LEVEL_DATA[displayLevel]

    const nodes = [
        { x: 20, y: 60, lit: level >= 1 },
        { x: 100, y: 30, lit: level >= 2 },
        { x: 170, y: 55, lit: level >= 3 }, // ember node
        { x: 235, y: 25, lit: false }, // future?
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-white/10 bg-black/90 backdrop-blur-xl max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-white/90">{data.title}</DialogTitle>
                    <p className="text-sm text-white/55 mt-1">
                        <span className="text-[#BB7331]">{data.subtitle}</span>
                        {data.subtitleTranslation && (
                            <span className="block text-white/40 text-xs mt-1">
                                {data.subtitleTranslation}
                            </span>
                        )}
                    </p>
                </DialogHeader>

                {/* Trail visualization */}
                <div className="mt-4 flex items-center justify-center">
                    <div className="relative h-24 w-64">
                        {/* Lines connecting nodes */}
                        <motion.div
                            initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                            className="absolute inset-0"
                        >
                            <svg className="h-full w-full" viewBox="0 0 260 90">
                                {/* Trail path */}
                                <path
                                    d="M20 60 L100 30 L170 55 L235 25"
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth="2"
                                    fill="none"
                                />
                                {/* Lit path segments */}
                                {level >= 1 && (
                                    <motion.path
                                        d="M20 60 L100 30"
                                        stroke="rgba(187,115,49,0.5)"
                                        strokeWidth="2"
                                        fill="none"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
                                    />
                                )}
                                {level >= 2 && (
                                    <motion.path
                                        d="M100 30 L170 55"
                                        stroke="rgba(187,115,49,0.5)"
                                        strokeWidth="2"
                                        fill="none"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 0.2 }}
                                    />
                                )}
                                {level >= 3 && (
                                    <motion.path
                                        d="M170 55 L235 25"
                                        stroke="rgba(187,115,49,0.5)"
                                        strokeWidth="2"
                                        fill="none"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 0.4 }}
                                    />
                                )}
                            </svg>
                        </motion.div>

                        {/* Nodes */}
                        {nodes.slice(0, 3).map((n, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    scale: prefersReducedMotion ? 1 : 0.8,
                                    opacity: prefersReducedMotion ? 1 : 0,
                                }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    delay: prefersReducedMotion ? 0 : 0.1 * i,
                                    duration: prefersReducedMotion ? 0 : 0.25,
                                }}
                                className="absolute rounded-full"
                                style={{
                                    left: n.x,
                                    top: n.y,
                                    width: n.lit ? 12 : 8,
                                    height: n.lit ? 12 : 8,
                                    background: n.lit ? "#BB7331" : "rgba(255,255,255,0.25)",
                                    boxShadow: n.lit
                                        ? "0 0 16px rgba(187,115,49,0.65)"
                                        : "none",
                                    transform: "translate(-50%, -50%)",
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-2 text-center">
                    <span className="text-xs text-[#BB7331] font-medium">{data.progress}</span>
                </div>

                {/* Hint */}
                {level < 3 && (
                    <div className="mt-4 text-xs text-white/45 text-center">
                        Tip: {data.hint}
                    </div>
                )}

                {level >= 3 && (
                    <div className="mt-4 text-xs text-white/45 text-center">
                        Keep exploring — Smarana rewards curiosity.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
