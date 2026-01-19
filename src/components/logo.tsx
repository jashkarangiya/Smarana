import { cn } from "@/lib/utils"

interface LogoProps {
    className?: string
    size?: "sm" | "md" | "lg"
}

export function Logo({ className, size = "md" }: LogoProps) {
    const sizeClasses = {
        sm: "h-8 w-8 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-lg font-mono font-bold",
                "bg-primary text-primary-foreground",
                sizeClasses[size],
                className
            )}
        >
            AR
        </div>
    )
}
