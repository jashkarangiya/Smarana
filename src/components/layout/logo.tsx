import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
    className?: string
    size?: "sm" | "md" | "lg"
}

const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
}

export function Logo({ className, size = "md" }: LogoProps) {
    const pixels = sizeMap[size]

    return (
        <div
            className={cn(
                "rounded-xl overflow-hidden",
                className
            )}
            style={{ width: pixels, height: pixels }}
        >
            <Image
                src="/logo.png"
                alt="Smarana"
                width={pixels}
                height={pixels}
                className="w-full h-full object-cover"
            />
        </div>
    )
}
