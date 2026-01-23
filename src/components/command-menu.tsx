"use client"

import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Search,
    Brain,
    Plus,
    LayoutDashboard,
    ListTodo,
    Activity,
    LogOut
} from "lucide-react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

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

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

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

            {/* Mobile Trigger */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-muted-foreground"
                onClick={() => setOpen(true)}
            >
                <Search className="h-5 w-5" />
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => runCommand(() => router.push("/review"))}>
                            <Brain className="mr-2 h-4 w-4" />
                            <span>Start Review</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/add"))}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Add Problem</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/problems"))}>
                            <ListTodo className="mr-2 h-4 w-4" />
                            <span>Problems</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/schedule"))}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Schedule</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/insights"))}>
                            <Activity className="mr-2 h-4 w-4" />
                            <span>Insights</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
