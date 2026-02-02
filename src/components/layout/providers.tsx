"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { PomodoroProvider } from "@/hooks/use-pomodoro"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    forcedTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <PomodoroProvider>
                        {children}
                    </PomodoroProvider>
                    <Toaster />
                </ThemeProvider>
            </QueryClientProvider>
        </SessionProvider>
    )
}
