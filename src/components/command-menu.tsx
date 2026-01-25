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

type UserHit = { username: string; name?: string | null; image?: string | null }
type ProblemHit = { id: string; title: string; difficulty: string; platform: string }

interface CommandMenuProps {
    onOpenPomodoro?: () => void
}

export function CommandMenu({ onOpenPomodoro }: CommandMenuProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [debouncedQuery, setDebouncedQuery] = React.useState("")
    const router = useRouter()

    // Debounce the search query
    const debouncedSetQuery = useDebouncedCallback((value: string) => {
        setDebouncedQuery(value)
    }, 250)

    React.useEffect(() => {
        debouncedSetQuery(query)
    }, [query, debouncedSetQuery])

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

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
                title="Search (⌘K)"
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
                                </CommandItem>
                                <CommandItem onSelect={() => go("/problems")}>
                                    <ListTodo className="mr-2 h-4 w-4" />
                                    <span>Problems</span>
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
                                </CommandItem>
                                <CommandItem onSelect={() => go("/settings")}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </CommandItem>
                            </CommandGroup>

                            <CommandSeparator />

                            <CommandGroup heading="Actions">
                                <CommandItem onSelect={() => go("/review")}>
                                    <Play className="mr-2 h-4 w-4 text-emerald-400" />
                                    <span>Start Review</span>
                                    <CommandShortcut>Today</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => go("/add")}>
                                    <Plus className="mr-2 h-4 w-4 text-blue-400" />
                                    <span>Add Problem</span>
                                </CommandItem>
                                {onOpenPomodoro && (
                                    <CommandItem
                                        onSelect={() =>
                                            runCommand(() => onOpenPomodoro())
                                        }
                                    >
                                        <Timer className="mr-2 h-4 w-4 text-amber-400" />
                                        <span>Open Pomodoro</span>
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
                                </CommandItem>
                                <CommandItem onSelect={() => go("/add")}>
                                    <Plus className="mr-2 h-4 w-4 text-blue-400" />
                                    <span>Add Problem</span>
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
