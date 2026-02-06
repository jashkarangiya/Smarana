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
    Trophy,
    Sparkles,
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

export const LANDING_NAV: NavLink[] = [
    { title: "How it Works", href: "/#how-it-works", icon: BookOpen, variant: "default" },
    { title: "Features", href: "/#features", icon: Sparkles, variant: "default" },
    { title: "FAQ", href: "/#faq", icon: Brain, variant: "default" },
]

export const UTILITY_NAV: NavLink[] = [
    { title: "Settings", href: "/settings", icon: Settings, variant: "utility" },
    { title: "Insights", href: "/insights", icon: Activity, variant: "utility" },
    { title: "Contests", href: "/contests", icon: Trophy, variant: "utility" },
    { title: "Resources", href: "/resources", icon: BookOpen, variant: "utility" },
    { title: "Profile", href: "/u/me", icon: Globe, variant: "utility" }, // href needs dynamic user replacement
]

export const ACTIONS_NAV: NavLink[] = [
    { title: "Review", href: "/review", icon: Brain, variant: "action" },
    { title: "Add Problem", href: "/add", icon: Plus, variant: "action" },
    { title: "Pomodoro", href: "#pomodoro", icon: Timer, variant: "action" },
]
