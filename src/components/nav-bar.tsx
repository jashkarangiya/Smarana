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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, ListTodo, Settings, LogOut, Brain, Zap, Star } from "lucide-react"
import { useStats } from "@/hooks/use-problems"

export function NavBar() {
    const { data: session } = useSession()
    const { data: stats } = useStats()
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <nav className="sticky top-0 z-50 w-full px-4 py-3">
            <div className="container mx-auto">
                <div className="flex h-14 items-center justify-between px-6 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg shadow-black/5">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-amber-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
                            <Brain className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden sm:block">AlgoRecall</span>
                    </Link>

                    {/* Center Navigation */}
                    {session && (
                        <div className="hidden md:flex items-center gap-1 bg-secondary/60 rounded-xl p-1.5">
                            <NavLink href="/dashboard" isActive={isActive("/dashboard")}>
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </NavLink>
                            <NavLink href="/problems" isActive={isActive("/problems")}>
                                <ListTodo className="h-4 w-4" />
                                Problems
                            </NavLink>
                        </div>
                    )}

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {session ? (
                            <>
                                {/* XP Badge */}
                                {stats && (
                                    <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-emerald-500/10 border border-primary/20">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="h-4 w-4 text-primary fill-primary/30" />
                                            <span className="text-sm font-bold">Lv.{stats.level || 1}</span>
                                        </div>
                                        <div className="w-px h-4 bg-border" />
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            <span className="text-sm font-semibold">{stats.xp || 0} XP</span>
                                        </div>
                                    </div>
                                )}

                                {/* User Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-11 w-11 rounded-xl p-0 ring-2 ring-transparent hover:ring-primary/30 transition-all duration-200">
                                            <Avatar className="h-10 w-10 rounded-xl">
                                                <AvatarImage src={session.user?.image || ""} />
                                                <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-amber-500 text-white font-bold text-lg">
                                                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                                        <div className="px-3 py-3 mb-2 rounded-lg bg-secondary/50">
                                            <p className="font-semibold">{session.user?.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {session.user?.email}
                                            </p>
                                        </div>

                                        {/* Mobile nav links */}
                                        <div className="md:hidden space-y-1 mb-2">
                                            <DropdownMenuItem asChild className="rounded-lg">
                                                <Link href="/dashboard" className="flex items-center gap-2">
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="rounded-lg">
                                                <Link href="/problems" className="flex items-center gap-2">
                                                    <ListTodo className="h-4 w-4" />
                                                    Problems
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </div>

                                        <DropdownMenuItem asChild className="rounded-lg">
                                            <Link href="/profile" className="flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => signOut()}
                                            className="rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" className="font-medium h-10 px-5 rounded-xl" asChild>
                                    <Link href="/sign-in">Sign In</Link>
                                </Button>
                                <Button className="font-semibold h-10 px-5 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow" asChild>
                                    <Link href="/register">Register</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

function NavLink({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
        >
            {children}
        </Link>
    )
}
