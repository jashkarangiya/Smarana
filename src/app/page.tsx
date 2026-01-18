"use client"

import { Button } from "@/components/ui/button"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowRight, Brain, Zap, Clock } from "lucide-react"
import { redirect } from "next/navigation"

export default function LandingPage() {
  const { data: session, status } = useSession()

  if (status === "authenticated") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20 text-center">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight lg:text-7xl">
          Master LeetCode with <span className="text-primary">Spaced Repetition</span>
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Never forget a pattern again. AlgoRecall syncs your LeetCode history and schedules reviews automatically.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => signIn("google")} className="h-12 px-8 text-lg">
            Sign in with Google
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
            Learn More
          </Button>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3 text-left">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Auto-Sync</h3>
            <p className="text-muted-foreground">
              Connect your LeetCode account and we'll automatically fetch your solved problems.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Smart Scheduling</h3>
            <p className="text-muted-foreground">
              We schedule reviews at 1, 3, 7, 14, and 30 days to maximize retention.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Daily Focus</h3>
            <p className="text-muted-foreground">
              See exactly what needs to be reviewed today. Don't waste time deciding what to solve.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
