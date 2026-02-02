"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Share2, Eye, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export function SettingsNav() {
    const pathname = usePathname()

    return (
        <nav className="space-y-1">
            <NavItem
                active={pathname === "/profile"}
                icon={<User className="h-4 w-4" />}
                label="Basic Info"
                href="/profile"
            />
            <NavItem
                active={pathname === "/profile/platforms"}
                icon={<Share2 className="h-4 w-4" />}
                label="Platforms"
                href="/profile/platforms"
            />
            <NavItem
                active={pathname === "/profile/visibility"}
                icon={<Eye className="h-4 w-4" />}
                label="Visibility"
                href="/profile/visibility"
            />
            <NavItem
                active={pathname === "/profile/accounts"}
                icon={<Shield className="h-4 w-4" />}
                label="Accounts"
                href="/profile/accounts"
            />
        </nav>
    )
}

function NavItem({ active, icon, label, href }: { active: boolean; icon: React.ReactNode; label: string; href: string }) {
    return (
        <Link
            href={href}
            className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                active ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : ""
            )}
            aria-current={active ? "page" : undefined}
        >
            {active && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary" />
            )}
            <span className={cn("transition-colors", active ? "text-primary" : "text-muted-foreground")}>{icon}</span>
            <span>{label}</span>
        </Link>
    )
}
