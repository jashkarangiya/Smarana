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
import { LayoutDashboard, ListTodo, Settings, LogOut, Brain, Zap, Star, Search } from "lucide-react"
import { useStats } from "@/hooks/use-problems"

export function NavBar() {
    const { data: session } = useSession()
    const { data: stats } = useStats()
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
            <div className="max-w-6xl mx-auto">
                {/* Floating pill navbar */}
                <div className="flex h-14 items-center justify-between px-2 bg-card/40 backdrop-blur-2xl border border-border/20 rounded-full shadow-lg shadow-black/10">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 pl-3 group">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <Brain className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-base hidden sm:block">AlgoRecall</span>
                    </Link>

                    {/* Center Navigation */}
                    {session && (
                        <div className="hidden md:flex items-center gap-1">
                            <NavLink href="/dashboard" isActive={isActive("/dashboard")}>
                                Dashboard
                            </NavLink>
                            <NavLink href="/problems" isActive={isActive("/problems")}>
                                Problems
                            </NavLink>
                        </div>
                    )}

                    {/* Right Side */}
                    <div className="flex items-center gap-2 pr-2">
                        {session ? (
                            <>
                                {/* XP Badge */}
                                {stats && (
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                                        <Star className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-xs font-semibold">Lv.{stats.level || 1}</span>
                                        <span className="text-xs text-muted-foreground">•</span>
                                        <span className="text-xs font-medium text-muted-foreground">{stats.xp || 0} XP</span>
                                    </div>
                                )}

                                {/* User Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-9 w-9 rounded-full p-0 hover:bg-muted/50 transition-colors">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={session.user?.image || ""} />
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-amber-600 text-white text-sm font-medium">
                                                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl bg-card/95 backdrop-blur-xl border-border/50">
                                        <div className="px-3 py-3 mb-2 rounded-lg bg-muted/50">
                                            <p className="font-medium">{session.user?.name}</p>
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
                                <Button variant="ghost" size="sm" className="rounded-full font-medium h-9 px-4" asChild>
                                    <Link href="/sign-in">Sign In</Link>
                                </Button>
                                <Button size="sm" className="rounded-full font-semibold h-9 px-5 bg-primary hover:bg-primary/90" asChild>
                                    <Link href="/register">Get Started</Link>
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
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-muted/80 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
        >
            {children}
        </Link>
    )
}
