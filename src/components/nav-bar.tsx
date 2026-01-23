"use client"

import Link from "next/link"
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
import { LayoutDashboard, ListTodo, Settings, LogOut, Sparkles, Menu, Plus, Calendar } from "lucide-react"
import { useStats } from "@/hooks/use-problems"
import { useState, useRef, useEffect, useCallback } from "react"

export function NavBar() {
    const { data: session } = useSession()
    const { data: stats } = useStats()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Refs for sliding indicator
    const tabsRef = useRef<HTMLDivElement>(null)
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, transform: 'translateX(0px)' })

    const isActive = (path: string) => pathname === path

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/schedule", label: "Schedule", icon: Calendar },
        { href: "/problems", label: "Problems", icon: ListTodo },
        { href: "/add", label: "Add", icon: Plus },
    ]

    // Calculate XP progress (0 to 1)
    const xpProgress = stats ? ((stats.xp || 0) % 500) / 500 : 0

    // Position the sliding indicator
    const updateIndicator = useCallback(() => {
        if (!tabsRef.current) return
        const activeTab = tabsRef.current.querySelector('[data-active="true"]') as HTMLElement
        if (!activeTab) return

        const tabsRect = tabsRef.current.getBoundingClientRect()
        const activeRect = activeTab.getBoundingClientRect()

        setIndicatorStyle({
            width: activeRect.width,
            transform: `translateX(${activeRect.left - tabsRect.left - 4}px)` // -4 for padding
        })
    }, [])

    useEffect(() => {
        updateIndicator()
        window.addEventListener('resize', updateIndicator)
        return () => window.removeEventListener('resize', updateIndicator)
    }, [pathname, updateIndicator])

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 py-3">
            <div className="max-w-6xl mx-auto">
                {/* Premium glass topbar */}
                <div
                    className="flex h-[72px] items-center justify-between px-4 rounded-[26px] border border-white/[0.08]"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), rgba(12,12,12,0.68)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
                    }}
                >
                    {/* Brand */}
                    <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-3 min-w-[140px] sm:min-w-[220px] group">
                        <div
                            className="w-11 h-11 rounded-[14px] flex items-center justify-center border transition-transform group-hover:scale-105"
                            style={{
                                background: 'rgba(214,162,75,0.16)',
                                borderColor: 'rgba(214,162,75,0.22)'
                            }}
                        >
                            <Sparkles className="h-5 w-5 text-[#d6a24b]" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white/92 hidden sm:block">
                            AlgoRecall
                        </span>
                    </Link>

                    {/* Segmented Control Tabs - Desktop */}
                    {session && (
                        <div
                            ref={tabsRef}
                            className="hidden md:flex relative gap-1 p-1 rounded-full"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)'
                            }}
                        >
                            {/* Sliding indicator */}
                            <div
                                className="absolute top-1 bottom-1 rounded-full transition-all duration-[220ms]"
                                style={{
                                    width: indicatorStyle.width,
                                    transform: indicatorStyle.transform,
                                    background: 'rgba(255,255,255,0.08)',
                                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 12px 24px rgba(0,0,0,0.35)',
                                    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
                                }}
                            />

                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    data-active={isActive(link.href)}
                                    className={`relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors select-none ${isActive(link.href)
                                        ? 'text-white/92'
                                        : 'text-white/62 hover:text-white/92'
                                        }`}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Actions / Status Cluster */}
                    <div className="flex items-center justify-end gap-3 min-w-[140px] sm:min-w-[220px]">
                        {session ? (
                            <>
                                {/* XP Chip - Desktop only, optional */}
                                {stats && (
                                    <div
                                        className="hidden lg:flex items-center gap-2 px-3 py-2.5 rounded-full font-semibold"
                                        style={{
                                            background: 'rgba(214,162,75,0.10)',
                                            border: '1px solid rgba(214,162,75,0.25)',
                                            color: 'rgba(255,255,255,0.88)'
                                        }}
                                    >
                                        <span className="text-[#d6a24b]">★</span>
                                        <span>Lv.{stats.level || 1}</span>
                                        <span className="opacity-60">·</span>
                                        <span>{stats.xp || 0}</span>
                                    </div>
                                )}

                                {/* Mobile Menu Button */}
                                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                    <SheetTrigger asChild className="md:hidden">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                                            <Menu className="h-5 w-5 text-white/80" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-[300px] p-0 bg-[#0c0c0c]/95 backdrop-blur-xl border-white/10">
                                        <SheetHeader className="p-6 pb-4 border-b border-white/10">
                                            <SheetTitle className="flex items-center gap-3">
                                                <AvatarWithProgress
                                                    progress={xpProgress}
                                                    image={session.user?.image}
                                                    name={session.user?.name}
                                                    size={48}
                                                />
                                                <div className="text-left">
                                                    <p className="font-semibold text-white">{session.user?.name}</p>
                                                    <p className="text-xs text-white/60 truncate max-w-[180px]">
                                                        {session.user?.email}
                                                    </p>
                                                </div>
                                            </SheetTitle>
                                        </SheetHeader>

                                        {/* XP Info - Mobile */}
                                        {stats && (
                                            <div
                                                className="mx-4 mt-4 flex items-center justify-between px-4 py-3 rounded-xl"
                                                style={{
                                                    background: 'rgba(214,162,75,0.10)',
                                                    border: '1px solid rgba(214,162,75,0.25)',
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[#d6a24b]">★</span>
                                                    <span className="font-bold text-white">Level {stats.level || 1}</span>
                                                </div>
                                                <span className="text-sm text-white/60">{stats.xp || 0} XP</span>
                                            </div>
                                        )}

                                        {/* Navigation Links */}
                                        <div className="p-4 space-y-1">
                                            {navLinks.map((link) => (
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
                                                    <span className="font-medium">{link.label}</span>
                                                </Link>
                                            ))}
                                            <Link
                                                href="/profile"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive("/profile")
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <Settings className="h-5 w-5" />
                                                <span className="font-medium">Settings</span>
                                            </Link>
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
                                    <DropdownMenuTrigger asChild className="hidden md:flex">
                                        <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a24b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full">
                                            <AvatarWithProgress
                                                progress={xpProgress}
                                                image={session.user?.image}
                                                name={session.user?.name}
                                                size={44}
                                            />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56 p-2 rounded-xl border-white/10"
                                        style={{
                                            background: 'rgba(12,12,12,0.95)',
                                            backdropFilter: 'blur(16px)',
                                        }}
                                    >
                                        <div className="px-3 py-3 mb-2 rounded-xl bg-white/5">
                                            <p className="font-semibold text-white">{session.user?.name}</p>
                                            <p className="text-xs text-white/60 truncate">
                                                {session.user?.email}
                                            </p>
                                            {stats && (
                                                <div className="flex items-center gap-2 mt-2 text-xs">
                                                    <span className="text-[#d6a24b]">★</span>
                                                    <span className="text-white/80">Level {stats.level || 1}</span>
                                                    <span className="text-white/40">•</span>
                                                    <span className="text-white/60">{stats.xp || 0} XP</span>
                                                </div>
                                            )}
                                        </div>
                                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-white/80 focus:text-white focus:bg-white/10">
                                            <Link href="/profile" className="flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="my-1 bg-white/10" />
                                        <DropdownMenuItem
                                            onClick={() => signOut()}
                                            className="rounded-lg cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="rounded-full font-medium h-10 px-4 text-white/80 hover:text-white hover:bg-white/5" asChild>
                                    <Link href="/sign-in">Sign In</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    className="rounded-full font-semibold h-10 px-5"
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
        </nav>
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
    return (
        <div
            className="rounded-full p-[2px] border border-white/10 cursor-pointer hover:scale-105 transition-transform"
            style={{
                width: size,
                height: size,
                background: `conic-gradient(#d6a24b ${progress * 360}deg, rgba(255,255,255,0.10) 0deg)`
            }}
        >
            <Avatar className="w-full h-full">
                <AvatarImage src={image || ""} />
                <AvatarFallback
                    className="text-white font-bold"
                    style={{
                        background: 'rgba(28,28,28,0.95)',
                        fontSize: size * 0.35
                    }}
                >
                    {name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
            </Avatar>
        </div>
    )
}
