"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Terminal } from "lucide-react";

export function NotFoundView() {
    return (
        <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden flex flex-col items-center justify-center bg-background text-foreground">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            {/* Floating Code Snippets */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
                <FloatingCode code="404" x="10%" y="20%" delay={0} color="text-red-500" />
                <FloatingCode code="return null;" x="80%" y="15%" delay={2} color="text-amber-500" />
                <FloatingCode code="throw new Error()" x="15%" y="70%" delay={4} color="text-blue-500" />
                <FloatingCode code="undefined" x="70%" y="80%" delay={1} color="text-purple-500" />
                <FloatingCode code="node.next = null" x="85%" y="40%" delay={3} color="text-emerald-500" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-4 max-w-3xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono mb-6">
                        <Terminal className="w-3 h-3" />
                        <span>RUNTIME_ERROR</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-2 font-mono">
                        404
                    </h1>

                    <h2 className="text-2xl md:text-4xl font-semibold tracking-tight mb-4 text-white/90">
                        Traversal Failed
                    </h2>

                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto">
                        We searched depth-first and breadth-first, but the node you're looking for is unreachable or has been garbage collected.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
                >
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full bg-[#BB7331] text-white hover:bg-[#BB7331]/90 shadow-lg shadow-primary/20 min-w-[160px]"
                    >
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Return to Root
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white min-w-[160px]"
                    >
                        <Link href="/dashboard">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}

function FloatingCode({ code, x, y, delay, color }: { code: string; x: string; y: string; delay: number; color: string }) {
    return (
        <motion.div
            className={`absolute font-mono text-sm font-bold ${color}`}
            style={{ left: x, top: y }}
            animate={{
                y: [0, -20, 0],
                opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
        >
            {code}
        </motion.div>
    );
}
