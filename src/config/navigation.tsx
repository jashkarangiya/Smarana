import {
    LayoutDashboard,
    ListTodo,
    Calendar,
    Activity,
    Settings,
    BookOpen,
    Brain,
    Plus,
    Globe,
    Timer,
    type LucideIcon
} from "lucide-react"

export interface NavLink {
    title: string
    href: string
    icon: LucideIcon
    variant: "default" | "action" | "utility"
    description?: string
}

export const MAIN_NAV: NavLink[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, variant: "default" },
    { title: "Problems", href: "/problems", icon: ListTodo, variant: "default" },
    { title: "Schedule", href: "/schedule", icon: Calendar, variant: "default" },
]

export const UTILITY_NAV: NavLink[] = [
    { title: "Settings", href: "/settings", icon: Settings, variant: "utility" },
    { title: "Insights", href: "/insights", icon: Activity, variant: "utility" },
    { title: "Resources", href: "/resources", icon: BookOpen, variant: "utility" },
    { title: "Profile", href: "/u/me", icon: Globe, variant: "utility" }, // href needs dynamic user replacement
]

export const ACTIONS_NAV: NavLink[] = [
    { title: "Review", href: "/review", icon: Brain, variant: "action" },
    { title: "Add Problem", href: "/add", icon: Plus, variant: "action" },
    { title: "Pomodoro", href: "#pomodoro", icon: Timer, variant: "action" },
]
