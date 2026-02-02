import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: {
        label: string
        href?: string
        onClick?: () => void
    }
    className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500", className)}>
            <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-4 ring-1 ring-border shadow-sm">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg tracking-tight mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                {description}
            </p>
            {action && (
                <Button
                    asChild={!!action.href}
                    onClick={action.onClick}
                    variant="outline"
                    className="gap-2 border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all font-medium"
                >
                    {action.href ? (
                        <Link href={action.href}>
                            {action.label}
                        </Link>
                    ) : (
                        action.label
                    )}
                </Button>
            )}
        </div>
    )
}
