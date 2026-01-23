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
import { LayoutDashboard, ListTodo, Settings, LogOut, Sparkles, Menu, Plus, Calendar, Activity, Brain, Trophy } from "lucide-react"
import { useStats, useProblems } from "@/hooks/use-problems"
import { motion } from "framer-motion"
import { useState } from "react"
import { CommandMenu } from "./command-menu"

export function NavBar() {
    const { data: session } = useSession()
    const { data: stats } = useStats()
    const { data: dueProblems } = useProblems("due")
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isActive = (path: string) => pathname === path

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/problems", label: "Problems", icon: ListTodo },
        { href: "/schedule", label: "Schedule", icon: Calendar },
    ]

    // Calculate XP progress (0 to 1)
    const xpProgress = stats ? ((stats.xp || 0) % 500) / 500 : 0
    const totalDue = dueProblems?.length || 0

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
                        <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-3 group">
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(214,162,75,0.3)]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(214,162,75,0.1), rgba(214,162,75,0.05))',
                                    borderColor: 'rgba(214,162,75,0.2)'
                                }}
                            >
                                <Sparkles className="h-4 w-4 text-[#d6a24b]" />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white/95 hidden md:block">
                                AlgoRecall
                            </span>
                        </Link>
                    </div>

                    {/* Segmented Control Tabs - Desktop */}
                    {session && (
                        <div className="hidden lg:flex relative p-1 rounded-full bg-black/20 border border-white/5">
                            {navLinks.map((link) => {
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
                                        {link.label}
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
                                {totalDue > 0 && (
                                    <Button
                                        asChild
                                        size="sm"
                                        className="hidden sm:flex rounded-full bg-[#d6a24b] text-black hover:bg-[#b8862f] h-9 px-4 font-semibold shadow-[0_0_15px_rgba(214,162,75,0.25)] hover:shadow-[0_0_20px_rgba(214,162,75,0.4)] transition-all"
                                    >
                                        <Link href="/review">
                                            <Brain className="mr-2 h-4 w-4" />
                                            Review ({totalDue})
                                        </Link>
                                    </Button>
                                )}

                                {/* Compact Search Trigger */}
                                <div className="ml-1">
                                    <CommandMenu />
                                </div>

                                {/* Mobile Menu Button */}
                                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                    <SheetTrigger asChild className="lg:hidden">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/5">
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
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-bold text-[#d6a24b] bg-[#d6a24b]/10 px-1.5 py-0.5 rounded">
                                                            LVL {stats?.level || 1}
                                                        </span>
                                                        <span className="text-xs text-white/50">{stats?.xp || 0} XP</span>
                                                    </div>
                                                </div>
                                            </SheetTitle>
                                        </SheetHeader>

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
                                                href="/insights"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive("/insights")
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <Activity className="h-5 w-5" />
                                                <span className="font-medium">Insights</span>
                                            </Link>
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
                                        <div className="px-3 py-3 mb-2 rounded-xl bg-white/5 flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-white/10">
                                                <AvatarImage src={session.user?.image || ""} />
                                                <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-white truncate">{session.user?.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-[#d6a24b] bg-[#d6a24b]/10 px-1.5 py-0.5 rounded border border-[#d6a24b]/20">
                                                        LVL {stats?.level || 1}
                                                    </span>
                                                    <span className="text-[10px] text-white/50">{stats?.xp || 0} XP</span>
                                                </div>
                                            </div>
                                        </div>

                                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-white/80 focus:text-white focus:bg-white/10 py-2.5">
                                            <Link href="/insights" className="flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-emerald-400" />
                                                <span className="flex-1">Insights</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-white/80 focus:text-white focus:bg-white/10 py-2.5">
                                            <Link href={`/u/${session.user?.username}`} className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-yellow-500" />
                                                <span className="flex-1">Public Profile</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-white/80 focus:text-white focus:bg-white/10 py-2.5">
                                            <Link href="/profile" className="flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                <span className="flex-1">Settings</span>
                                            </Link>
                                        </DropdownMenuItem>

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
    return (
        <div
            className="rounded-full p-[2px] border border-white/10 relative"
            style={{
                width: size,
                height: size,
                background: `conic-gradient(#d6a24b ${progress * 360}deg, rgba(255,255,255,0.10) 0deg)`
            }}
        >
            <Avatar className="w-full h-full border-2 border-[#121212]">
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
