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

        {/* Product Preview Section (CSS Mockup) */}
        <section className="py-12 px-4 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="rounded-xl border border-white/10 bg-[#0c0c0c] shadow-2xl overflow-hidden relative group">
              {/* Mock Browser Header */}
              <div className="h-10 border-b border-white/5 bg-black/50 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                </div>
                <div className="flex-1 text-center text-[10px] text-muted-foreground font-mono">
                  algorecall.com/dashboard
                </div>
              </div>
              {/* Mock Content */}
              <div className="p-8 grid gap-8 md:grid-cols-[250px_1fr]">
                {/* Sidebar Mock */}
                <div className="hidden md:flex flex-col gap-4 border-r border-white/5 pr-6">
                  <div className="h-8 w-32 bg-white/5 rounded-md" />
                  <div className="space-y-2 mt-4">
                    <div className="h-4 w-full bg-muted/10 rounded-sm" />
                    <div className="h-4 w-3/4 bg-muted/10 rounded-sm" />
                    <div className="h-4 w-5/6 bg-muted/10 rounded-sm" />
                  </div>
                </div>
                {/* Main Content Mock */}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-32 flex-1 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/10" />
                    <div className="h-32 flex-1 bg-muted/5 rounded-xl border border-white/5" />
                    <div className="h-32 flex-1 bg-muted/5 rounded-xl border border-white/5" />
                  </div>
                  <div className="h-64 bg-muted/5 rounded-xl border border-white/5" />
                </div>
              </div>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent h-40 bottom-0 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How it works</h2>
              <p className="text-muted-foreground">Three simple steps to mastery</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { step: "01", title: "Solve Problems", desc: "Solve problems on LeetCode. We automatically sync your progress." },
                { step: "02", title: "Smart Scheduling", desc: "We calculate the optimal time for you to review based on forgetting curves." },
                { step: "03", title: "Review & Retain", desc: "Review problems with our guidance to lock patterns into long-term memory." }
              ].map((s, i) => (
                <div key={i} className="relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="text-4xl font-mono font-bold text-primary/20 mb-4">{s.step}</div>
                  <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
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
