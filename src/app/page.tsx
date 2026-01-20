"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, BookOpen, Sparkles } from "lucide-react"

export default function LandingPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section - Tatva Style */}
        <section className="min-h-screen flex flex-col items-center justify-center relative px-4">
          {/* Subtle Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* Floating Code Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
            <div className="absolute top-20 left-[10%] animate-float opacity-20">
              <div className="bg-card border border-border/50 rounded-lg p-3 shadow-lg">
                <code className="text-xs text-emerald-400">def twoSum(nums, target):</code>
              </div>
            </div>
            <div className="absolute top-40 right-[15%] animate-float-delayed opacity-20">
              <div className="bg-card border border-border/50 rounded-lg p-3 shadow-lg">
                <code className="text-xs text-primary">class TreeNode:</code>
              </div>
            </div>
            <div className="absolute bottom-32 left-[20%] animate-float opacity-15">
              <div className="bg-card border border-border/50 rounded-lg p-3 shadow-lg">
                <code className="text-xs text-rose-400">// Binary Search</code>
              </div>
            </div>
            <div className="absolute bottom-40 right-[10%] animate-float-delayed opacity-15">
              <div className="bg-card border border-border/50 rounded-lg p-3 shadow-lg">
                <code className="text-xs text-blue-400">stack.push(node)</code>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1]">
              From practice to mastering the{" "}
              <span className="text-primary">patterns</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Dedicated to helping you retain algorithm patterns through spaced repetition,
              synced with your LeetCode progress.
            </p>

            {/* CTA */}
            <div className="pt-4">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-medium rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                asChild
              >
                <Link href="/register">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section - Tatva Style */}
        <section className="py-24 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4">
                Your Gateway to <span className="text-primary">Algorithm Mastery</span>
              </h2>
              <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
                AlgoRecall helps you remember what you learn through scientifically-proven
                spaced repetition techniques.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <FeatureCard
                  icon={<Brain className="h-5 w-5" />}
                  title="Smart Scheduling"
                  description="Review problems at optimal intervals using spaced repetition algorithms."
                />
                <FeatureCard
                  icon={<Sparkles className="h-5 w-5" />}
                  title="LeetCode Sync"
                  description="Automatically import your solved problems and track your progress."
                />
                <FeatureCard
                  icon={<BookOpen className="h-5 w-5" />}
                  title="Pattern Recognition"
                  description="Group problems by patterns to build lasting intuition."
                />
                <FeatureCard
                  icon={<ArrowRight className="h-5 w-5" />}
                  title="XP & Streaks"
                  description="Stay motivated with gamification: earn XP and maintain streaks."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA - Tatva Style */}
        <section className="py-24 border-t border-border/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">अभ्यासेन सिद्धिः</p>
            <p className="text-xs text-muted-foreground/60 mb-8">Perfection through practice</p>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer - Tatva Style */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-sm">AlgoRecall</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your spaced repetition companion for algorithms
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AlgoRecall
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
