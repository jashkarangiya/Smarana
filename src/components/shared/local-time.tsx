"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface LocalTimeProps {
    timezone: string
    showIcon?: boolean
    className?: string
}

export function LocalTime({ timezone, showIcon = true, className }: LocalTimeProps) {
    const [now, setNow] = React.useState(() => new Date())
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        const id = setInterval(() => setNow(new Date()), 60_000)
        return () => clearInterval(id)
    }, [])

    // Prevent hydration mismatch
    if (!mounted) {
        return null
    }

    const formatted = new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        hour: "numeric",
        minute: "2-digit",
    }).format(now)

    // Get a friendly timezone name
    const timezoneName = timezone.replace(/_/g, " ").split("/").pop() || timezone

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={className}>
                        {showIcon && <Clock className="h-3 w-3 mr-1.5 inline text-[#BB7331]" />}
                        <span className="text-white/50">Local time:</span>{" "}
                        <span className="text-white/70">{formatted}</span>
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{timezoneName}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
