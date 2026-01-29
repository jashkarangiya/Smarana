"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, Timer, LogOut } from "lucide-react"
import { useStats, useProblems } from "@/hooks/use-problems"
import { motion } from "framer-motion"
import { useState, useRef, useCallback } from "react"
import { CommandMenu } from "./command-menu"
import { NotificationsBell } from "./notifications-bell"
import { PomodoroSheet } from "./pomodoro-sheet"
import { usePomodoro } from "@/hooks/use-pomodoro"
import { useEasterEgg } from "./ember-trail-provider"
import { MAIN_NAV, UTILITY_NAV, ACTIONS_NAV } from "@/config/navigation"

export function NavBar() {
    const { data: session } = useSession()
    const { data: stats } = useStats()
    const { data: dueProblems } = useProblems("due")
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [pomodoroOpen, setPomodoroOpen] = useState(false)

    // Use shared Pomodoro context for consistent state
    const { isActive: pomodoroActive, timeLeft: pomodoroTimeLeft, formatTime } = usePomodoro()

    // Easter egg: 5-click trigger on logo
    const { triggerUnlock } = useEasterEgg()
    const clickCountRef = useRef(0)
    const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleLogoClick = useCallback((e: React.MouseEvent) => {
        // Don't prevent navigation, just track clicks
        clickCountRef.current += 1

        // Reset click count after 1.8 seconds of inactivity
        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current)
        }
        clickTimerRef.current = setTimeout(() => {
            clickCountRef.current = 0
        }, 1800)

        // Trigger easter egg on 5 clicks
        if (clickCountRef.current >= 5) {
            e.preventDefault()
            clickCountRef.current = 0
            triggerUnlock()
        }
    }, [triggerUnlock])

    const isActive = (path: string) => pathname === path

    // Calculate XP progress (0 to 1)
    const xpProgress = stats ? ((stats.xp || 0) % 500) / 500 : 0
    const totalDue = dueProblems?.length || 0

    // Resolve dynamic links (e.g. /u/me -> /u/username)
    const resolveHref = (href: string) => {
        if (href === "/u/me" && session?.user?.username) {
            return `/u/${session.user.username}`
        }
        return href
    }

    // Find specific actions from config
    const reviewAction = ACTIONS_NAV.find(a => a.title === "Review")

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 py-3">
            <div className="max-w-7xl mx-auto">
                {/* Premium glass topbar */}
                <div
                    className="flex h-[60px] items-center justify-between px-4 rounded-[18px] border border-white/[0.06]"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(20,20,20,0.7), rgba(12,12,12,0.8))',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                >
                    {/* Brand */}
                    <div className="flex items-center gap-4">
                        <Link
                            href={session ? "/dashboard" : "/"}
                            className="flex items-center gap-2.5 group"
                            onClick={handleLogoClick}
                        >
                            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(214,162,75,0.3)]">
                                <Image
                                    src="/logo.png"
                                    alt="Smarana"
                                    width={36}
                                    height={36}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white/95 hidden md:block leading-none">
                                Smarana
                            </span>
                        </Link>
                    </div>

                    {/* Segmented Control Tabs - Desktop (Consuming MAIN_NAV) */}
                    {session && (
                        <div className="hidden lg:flex relative p-1 rounded-full bg-black/20 border border-white/5">
                            {MAIN_NAV.map((link) => {
                                const active = isActive(link.href)
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors select-none ${active
                                            ? 'text-white'
                                            : 'text-white/50 hover:text-white/80'
                                            }`}
                                    >
                                        {active && (
                                            <motion.div
                                                layoutId="navbar-indicator"
                                                className="absolute inset-0 rounded-full bg-white/10 shadow-sm"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                style={{ zIndex: -1 }}
                                            />
                                        )}
                                        <link.icon className={`h-4 w-4 ${active ? "text-[#d6a24b]" : "opacity-70"}`} />
                                        {link.title}
                                    </Link>
                                )
                            })}
                        </div>
                    )}

                    {/* Actions / Status Cluster */}
                    <div className="flex items-center justify-end gap-3">
                        {session ? (
                            <>
                                {/* Review CTA - The ONLY prominent action */}
                                {totalDue > 0 && reviewAction && (
                                    <Button
                                        asChild
                                        size="sm"
                                        className="hidden sm:flex rounded-full bg-[#d6a24b] text-black hover:bg-[#b8862f] h-9 px-4 font-semibold shadow-[0_0_15px_rgba(214,162,75,0.25)] hover:shadow-[0_0_20px_rgba(214,162,75,0.4)] transition-all"
                                    >
                                        <Link href={reviewAction.href}>
                                            <reviewAction.icon className="mr-2 h-4 w-4" />
                                            {reviewAction.title} ({totalDue})
                                        </Link>
                                    </Button>
                                )}

                                {/* Compact Search Trigger */}
                                <div className="ml-1">
                                    <CommandMenu onOpenPomodoro={() => setPomodoroOpen(true)} />
                                </div>

                                {/* Pomodoro Timer */}
                                <Button
                                    variant="ghost"
                                    className={`relative h-9 rounded-lg hover:bg-white/10 transition-colors hidden sm:flex items-center gap-1.5 px-2 ${pomodoroActive ? "text-amber-400" : "text-white/50 hover:text-white"
                                        }`}
                                    onClick={() => setPomodoroOpen(true)}
                                    title="Pomodoro Timer"
                                >
                                    <Timer className="h-4 w-4" />
                                    {pomodoroActive && (
                                        <span className="text-xs font-mono tabular-nums">
                                            {formatTime(pomodoroTimeLeft)}
                                        </span>
                                    )}
                                </Button>

                                {/* Pomodoro Sheet */}
                                <PomodoroSheet open={pomodoroOpen} onOpenChange={setPomodoroOpen} />

                                {/* Notifications Bell */}
                                <NotificationsBell />

                                {/* Mobile Menu Button */}
                                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                    <SheetTrigger asChild className="lg:hidden">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/5">
                                            <Menu className="h-5 w-5 text-white/80" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0 bg-[#0c0c0c]/95 backdrop-blur-xl border-white/10">
                                        <SheetHeader className="p-4 sm:p-6 pb-4 border-b border-white/10">
                                            <SheetTitle className="flex items-center gap-3">
                                                <Link
                                                    href={`/u/${session.user?.username}`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
                                                >
                                                    <AvatarWithProgress
                                                        progress={xpProgress}
                                                        image={session.user?.image}
                                                        name={session.user?.name}
                                                        size={44}
                                                    />
                                                    <div className="text-left min-w-0 flex-1">
                                                        <p className="font-semibold text-white truncate">{session.user?.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs font-bold text-[#d6a24b] bg-[#d6a24b]/10 px-1.5 py-0.5 rounded">
                                                                LVL {stats?.level || 1}
                                                            </span>
                                                            <span className="text-xs text-white/50">@{session.user?.username}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </SheetTitle>
                                        </SheetHeader>

                                        {/* Review CTA for Mobile */}
                                        {totalDue > 0 && reviewAction && (
                                            <div className="p-4 pb-2">
                                                <Button
                                                    asChild
                                                    className="w-full rounded-xl bg-[#d6a24b] text-black hover:bg-[#b8862f] h-11 font-semibold shadow-[0_0_15px_rgba(214,162,75,0.25)]"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <Link href={reviewAction.href}>
                                                        <reviewAction.icon className="mr-2 h-4 w-4" />
                                                        Review {totalDue} Problems
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}

                                        {/* Navigation Links (Consuming config) */}
                                        <div className="p-4 pt-2 space-y-1">
                                            {MAIN_NAV.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(link.href)
                                                        ? 'bg-white/10 text-white'
                                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <link.icon className="h-5 w-5" />
                                                    <span className="font-medium">{link.title}</span>
                                                </Link>
                                            ))}

                                            {/* Utility Links in Mobile */}
                                            {UTILITY_NAV.map((link) => {
                                                const href = resolveHref(link.href)
                                                return (
                                                    <Link
                                                        key={link.title}
                                                        href={href}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(href)
                                                            ? 'bg-white/10 text-white'
                                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        <link.icon className="h-5 w-5" />
                                                        <span className="font-medium">{link.title}</span>
                                                    </Link>
                                                )
                                            })}

                                            {/* Pomodoro Timer for Mobile */}
                                            <button
                                                onClick={() => {
                                                    setMobileMenuOpen(false)
                                                    setPomodoroOpen(true)
                                                }}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left ${pomodoroActive
                                                    ? 'bg-amber-500/10 text-amber-400'
                                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <Timer className="h-5 w-5" />
                                                <span className="font-medium">Pomodoro Timer</span>
                                                {pomodoroActive && (
                                                    <span className="ml-auto text-sm font-mono tabular-nums">
                                                        {formatTime(pomodoroTimeLeft)}
                                                    </span>
                                                )}
                                            </button>
                                        </div>

                                        {/* Sign Out */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start gap-3 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                                                onClick={() => {
                                                    setMobileMenuOpen(false)
                                                    signOut()
                                                }}
                                            >
                                                <LogOut className="h-5 w-5" />
                                                Log out
                                            </Button>
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                {/* Avatar with Progress Ring - Desktop */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild className="hidden lg:flex">
                                        <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a24b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full transition-transform active:scale-95">
                                            <AvatarWithProgress
                                                progress={xpProgress}
                                                image={session.user?.image}
                                                name={session.user?.name}
                                                size={38}
                                            />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-64 p-2 rounded-xl border-white/10 shadow-2xl"
                                        style={{
                                            background: 'rgba(12,12,12,0.95)',
                                            backdropFilter: 'blur(16px)',
                                        }}
                                    >
                                        <DropdownMenuItem asChild className="p-0 mb-2 focus:bg-transparent">
                                            <Link
                                                href={`/u/${session.user?.username}`}
                                                className="px-3 py-3 rounded-xl bg-white/5 flex items-center gap-3 hover:bg-white/[0.08] transition-colors w-full cursor-pointer"
                                            >
                                                <Avatar className="h-10 w-10 border border-white/10">
                                                    <AvatarImage src={session.user?.image || ""} />
                                                    <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                    <p className="font-semibold text-white truncate">{session.user?.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5 overflow-hidden">
                                                        <span className="text-[10px] font-bold text-[#d6a24b] bg-[#d6a24b]/10 px-1.5 py-0.5 rounded border border-[#d6a24b]/20 flex-shrink-0">
                                                            LVL {stats?.level || 1}
                                                        </span>
                                                        <span className="text-[10px] text-white/50 truncate">@{session.user?.username}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>

                                        {UTILITY_NAV.map((link) => {
                                            const href = resolveHref(link.href)
                                            if (link.title === "Profile") return null
                                            return (
                                                <DropdownMenuItem key={link.title} asChild className="rounded-lg cursor-pointer text-white/80 focus:text-white focus:bg-white/10 py-2.5">
                                                    <Link href={href} className="flex items-center gap-2">
                                                        <link.icon className="h-4 w-4" />
                                                        <span className="flex-1">{link.title}</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            )
                                        })}

                                        <DropdownMenuSeparator className="my-1 bg-white/10" />

                                        {MAIN_NAV.filter(l => !['Dashboard', 'Problems', 'Schedule'].includes(l.title)).map(link => (
                                            <DropdownMenuItem key={link.title} asChild className="rounded-lg cursor-pointer text-white/80 focus:text-white focus:bg-white/10 py-2.5">
                                                <Link href={link.href} className="flex items-center gap-2">
                                                    <link.icon className="h-4 w-4" />
                                                    <span className="flex-1">{link.title}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}

                                        <DropdownMenuSeparator className="my-1 bg-white/10" />
                                        <DropdownMenuItem
                                            onClick={() => signOut()}
                                            className="rounded-lg cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10 py-2.5"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="rounded-full font-medium h-9 px-4 text-white/80 hover:text-white hover:bg-white/5" asChild>
                                    <Link href="/sign-in">Sign In</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    className="rounded-full font-semibold h-9 px-5"
                                    style={{
                                        background: 'linear-gradient(135deg, #d6a24b, #b8862f)',
                                        boxShadow: '0 8px 24px rgba(214,162,75,0.3)'
                                    }}
                                    asChild
                                >
                                    <Link href="/register">Get Started</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav >
    )
}

// Avatar with conic gradient progress ring
function AvatarWithProgress({
    progress,
    image,
    name,
    size = 44
}: {
    progress: number
    image?: string | null
    name?: string | null
    size?: number
}) {
    const progressDeg = Math.max(0, Math.min(1, progress)) * 360

    return (
        <div
            className="rounded-full p-[2px] relative"
            style={{
                width: size,
                height: size,
                background: `conic-gradient(from 0deg, #d6a24b ${progressDeg}deg, rgba(255,255,255,0.10) ${progressDeg}deg 360deg)`
            }}
        >
            <Avatar className="w-full h-full border-2 border-[#0a0a0a]">
                <AvatarImage src={image || ""} />
                <AvatarFallback
                    className="text-white font-bold bg-[#1c1c1c]"
                    style={{
                        fontSize: size * 0.35
                    }}
                >
                    {name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
            </Avatar>
        </div>
    )
}
