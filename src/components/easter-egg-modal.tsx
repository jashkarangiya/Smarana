"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface EasterEggModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
}

export function EasterEggModal({ open, onOpenChange }: EasterEggModalProps) {
    // Check for reduced motion preference
    const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const nodes = [
        { x: 20, y: 60, glow: false },
        { x: 100, y: 30, glow: false },
        { x: 170, y: 55, glow: true }, // ember node
        { x: 235, y: 25, glow: false },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-white/10 bg-black/90 backdrop-blur-xl max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-white/90">Ember Node Found</DialogTitle>
                    <p className="text-sm text-white/55 mt-1">
                        <span className="text-[#BB7331]">स्मरण</span> — the art of
                        remembering.
                    </p>
                </DialogHeader>

                {/* Minimal graph animation */}
                <div className="mt-4 flex items-center justify-center">
                    <div className="relative h-24 w-64">
                        {/* Lines connecting nodes */}
                        <motion.div
                            initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                            className="absolute inset-0"
                        >
                            <svg className="h-full w-full opacity-40" viewBox="0 0 260 90">
                                <path
                                    d="M20 60 L100 30 L170 55 L235 25"
                                    stroke="rgba(255,255,255,0.25)"
                                    strokeWidth="2"
                                    fill="none"
                                />
                            </svg>
                        </motion.div>

                        {/* Nodes */}
                        {nodes.map((n, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    scale: prefersReducedMotion ? 1 : 0.8,
                                    opacity: prefersReducedMotion ? 1 : 0,
                                }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    delay: prefersReducedMotion ? 0 : 0.05 * i,
                                    duration: prefersReducedMotion ? 0 : 0.25,
                                }}
                                className="absolute rounded-full"
                                style={{
                                    left: n.x,
                                    top: n.y,
                                    width: 10,
                                    height: 10,
                                    background: n.glow ? "#BB7331" : "rgba(255,255,255,0.55)",
                                    boxShadow: n.glow
                                        ? "0 0 16px rgba(187,115,49,0.65)"
                                        : "none",
                                    transform: "translate(-50%, -50%)",
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-4 text-xs text-white/45 text-center">
                    Tip: Keep exploring — Smarana rewards curiosity.
                </div>
            </DialogContent>
        </Dialog>
    );
}
