"use client"

import * as React from "react"
import {
    Calendar,
    Settings,
    Search,
    Brain,
    Plus,
    LayoutDashboard,
    ListTodo,
    Activity,
    Users,
    Timer,
    Play,
    User,
    FileCode,
    ChevronRight,
    Sparkles,
    BookOpen,
} from "lucide-react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { useQuery } from "@tanstack/react-query"
import { useDebouncedCallback } from "use-debounce"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useEasterEgg } from "./ember-trail-provider"

type UserHit = { username: string; name?: string | null; image?: string | null }
type ProblemHit = { id: string; title: string; difficulty: string; platform: string }

interface CommandMenuProps {
    onOpenPomodoro?: () => void
}

export function CommandMenu({ onOpenPomodoro }: CommandMenuProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [debouncedQuery, setDebouncedQuery] = React.useState("")
    const [isMac, setIsMac] = React.useState(true)
    const router = useRouter()
    const { triggerUnlock } = useEasterEgg()

    // Detect OS for keyboard shortcut display
    React.useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
    }, [])

    // Debounce the search query
    const debouncedSetQuery = useDebouncedCallback((value: string) => {
        setDebouncedQuery(value)
    }, 250)

    React.useEffect(() => {
        debouncedSetQuery(query)
    }, [query, debouncedSetQuery])

    // Modifier key helper
    const modKey = isMac ? "⌘" : "Ctrl+"

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            const mod = e.metaKey || e.ctrlKey

            // Open command menu
            if (e.key === "k" && mod) {
                e.preventDefault()
                setOpen((open) => !open)
                return
            }

            // Global shortcuts (work even when menu is closed)
            if (mod) {
                switch (e.key.toLowerCase()) {
                    case "d":
                        e.preventDefault()
                        router.push("/dashboard")
                        break
                    case "p":
                        e.preventDefault()
                        router.push("/problems")
                        break
                    case "r":
                        e.preventDefault()
                        router.push("/review")
                        break
                    case "n":
                        e.preventDefault()
                        router.push("/add")
                        break
                    case "i":
                        e.preventDefault()
                        router.push("/insights")
                        break
                    case ",":
                        e.preventDefault()
                        router.push("/settings")
                        break
                    case "t":
                        if (onOpenPomodoro) {
                            e.preventDefault()
                            onOpenPomodoro()
                        }
                        break
                }
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [router, onOpenPomodoro])

    // Search problems
    const problemsQuery = useQuery({
        queryKey: ["search-problems", debouncedQuery],
        enabled: debouncedQuery.trim().length >= 2,
        queryFn: async () => {
            const res = await fetch(`/api/search/problems?q=${encodeURIComponent(debouncedQuery.trim())}`)
            if (!res.ok) return []
            return (await res.json()) as ProblemHit[]
        },
        staleTime: 30000,
    })

    // Search users
    const usersQuery = useQuery({
        queryKey: ["search-users", debouncedQuery],
        enabled: debouncedQuery.trim().length >= 2,
        queryFn: async () => {
            const res = await fetch(`/api/search/users?q=${encodeURIComponent(debouncedQuery.trim())}`)
            if (!res.ok) return []
            return (await res.json()) as UserHit[]
        },
        staleTime: 30000,
    })

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        setQuery("")
        command()
    }, [])

    const go = (href: string) => {
        runCommand(() => router.push(href))
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy":
                return "text-emerald-400"
            case "medium":
                return "text-amber-400"
            case "hard":
                return "text-red-400"
            default:
                return "text-muted-foreground"
        }
    }

    const hasSearchResults =
        debouncedQuery.trim().length >= 2 &&
        ((problemsQuery.data?.length ?? 0) > 0 || (usersQuery.data?.length ?? 0) > 0)

    return (
        <>
            <Button
                variant="ghost"
                className="relative h-9 w-9 p-0 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                onClick={() => setOpen(true)}
                title={`Search (${isMac ? "⌘" : "Ctrl+"}K)`}
            >
                <Search className="h-5 w-5" />
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Type a command or search..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {debouncedQuery.trim().length >= 2
                            ? "No results found."
                            : "Start typing to search..."}
                    </CommandEmpty>

                    {/* Navigation - show when no search query */}
                    {!debouncedQuery.trim() && (
                        <>
                            <CommandGroup heading="Navigation">
                                <CommandItem onSelect={() => go("/dashboard")}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                    <CommandShortcut>{modKey}D</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => go("/problems")}>
                                    <ListTodo className="mr-2 h-4 w-4" />
                                    <span>Problems</span>
                                    <CommandShortcut>{modKey}P</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => go("/schedule")}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Schedule</span>
                                </CommandItem>
                                <CommandItem onSelect={() => go("/friends")}>
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>Friends</span>
                                </CommandItem>
                                <CommandItem onSelect={() => go("/insights")}>
                                    <Activity className="mr-2 h-4 w-4" />
                                    <span>Insights</span>
                                    <CommandShortcut>{modKey}I</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => go("/settings")}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                    <CommandShortcut>{modKey},</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => go("/resources")}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <span>Resources</span>
                                </CommandItem>
                            </CommandGroup>

                            <CommandSeparator />

                            <CommandGroup heading="Actions">
                                <CommandItem onSelect={() => go("/review")}>
                                    <Play className="mr-2 h-4 w-4 text-emerald-400" />
                                    <span>Start Review</span>
                                    <CommandShortcut>{modKey}R</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => go("/add")}>
                                    <Plus className="mr-2 h-4 w-4 text-blue-400" />
                                    <span>Add Problem</span>
                                    <CommandShortcut>{modKey}N</CommandShortcut>
                                </CommandItem>
                                {onOpenPomodoro && (
                                    <CommandItem
                                        onSelect={() =>
                                            runCommand(() => onOpenPomodoro())
                                        }
                                    >
                                        <Timer className="mr-2 h-4 w-4 text-amber-400" />
                                        <span>Open Pomodoro</span>
                                        <CommandShortcut>{modKey}T</CommandShortcut>
                                    </CommandItem>
                                )}
                            </CommandGroup>
                        </>
                    )}

                    {/* Search Results */}
                    {debouncedQuery.trim().length >= 2 && (
                        <>
                            {/* My Problems */}
                            {(problemsQuery.data?.length ?? 0) > 0 && (
                                <CommandGroup heading="My Problems">
                                    {problemsQuery.data?.slice(0, 8).map((problem) => (
                                        <CommandItem
                                            key={problem.id}
                                            onSelect={() => go(`/problems/${problem.id}`)}
                                            className="flex items-center gap-2"
                                        >
                                            <FileCode className="h-4 w-4 text-muted-foreground" />
                                            <span className="flex-1 truncate">{problem.title}</span>
                                            <span
                                                className={`text-xs font-medium ${getDifficultyColor(
                                                    problem.difficulty
                                                )}`}
                                            >
                                                {problem.difficulty}
                                            </span>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {hasSearchResults && <CommandSeparator />}

                            {/* Public Users */}
                            {(usersQuery.data?.length ?? 0) > 0 && (
                                <CommandGroup heading="Users">
                                    {usersQuery.data?.slice(0, 8).map((user) => (
                                        <CommandItem
                                            key={user.username}
                                            onSelect={() => go(`/u/${user.username}`)}
                                            className="flex items-center gap-2"
                                        >
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={user.image || ""} />
                                                <AvatarFallback className="text-[10px]">
                                                    {user.name?.[0] || user.username?.[0] || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">@{user.username}</span>
                                            {user.name && (
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {user.name}
                                                </span>
                                            )}
                                            <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {/* Still show navigation when searching */}
                            <CommandSeparator />
                            <CommandGroup heading="Quick Actions">
                                <CommandItem onSelect={() => go("/review")}>
                                    <Play className="mr-2 h-4 w-4 text-emerald-400" />
                                    <span>Start Review</span>
                                    <CommandShortcut>{modKey}R</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => go("/add")}>
                                    <Plus className="mr-2 h-4 w-4 text-blue-400" />
                                    <span>Add Problem</span>
                                    <CommandShortcut>{modKey}N</CommandShortcut>
                                </CommandItem>
                            </CommandGroup>

                            {/* Secret Easter Egg Command */}
                            {debouncedQuery.toLowerCase().includes("smarana") && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup heading="Secret" forceMount>
                                        <CommandItem
                                            value="smarana invoke"
                                            onSelect={() => {
                                                runCommand(() => triggerUnlock())
                                            }}
                                        >
                                            <Sparkles className="mr-2 h-4 w-4 text-[#BB7331]" />
                                            <span>Invoke <span className="text-[#BB7331]">स्मरण</span></span>
                                        </CommandItem>
                                    </CommandGroup>
                                </>
                            )}
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
