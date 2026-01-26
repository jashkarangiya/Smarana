import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Network } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 pt-32 sm:pt-40 relative overflow-hidden bg-background">
            {/* Background Tech Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-red-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center space-y-6 sm:space-y-8 max-w-lg mx-auto">
                {/* Animated Icon */}
                <div className="relative mx-auto w-20 h-20 sm:w-32 sm:h-32 mb-6 sm:mb-8">
                    <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-2 border-2 border-dashed border-red-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Network className="h-8 w-8 sm:h-12 sm:w-12 text-white/20 animate-pulse" />
                    </div>
                    {/* "Floating Note" effect */}
                    <div className="absolute -top-4 -right-4 bg-red-500/10 border border-red-500/20 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs text-red-400 font-mono animate-bounce">
                        null
                    </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent select-none">
                        404
                    </h1>
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight px-4">
                        Node Not Found
                    </h2>
                    <div className="font-mono text-xs sm:text-sm md:text-base text-muted-foreground bg-black/40 border border-white/5 p-4 rounded-lg backdrop-blur-sm max-w-[calc(100vw-2rem)] sm:max-w-sm mx-auto">
                        <span className="text-red-400">Error:</span> The requested pointer references a memory address that has been garbage collected.
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[200px]" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        Return to Root
                    </Link>
                </Button>
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/problems">
                        <AlertCircle className="h-4 w-4" />
                        Debug Problems
                    </Link>
                </Button>
            </div>
        </div>

    )
}
