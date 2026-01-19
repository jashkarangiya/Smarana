"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Zap, Brain, Trophy, Code2, Calendar, TrendingUp, Star, Users, Clock, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 overflow-hidden relative">
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 rounded-full blur-3xl" />
          </div>

          {/* Floating Code Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
            <div className="absolute top-20 left-[10%] animate-float opacity-20">
              <div className="bg-card border rounded-lg p-3 shadow-lg">
                <code className="text-xs text-emerald-400">def twoSum(nums, target):</code>
              </div>
            </div>
            <div className="absolute top-40 right-[15%] animate-float-delayed opacity-20">
              <div className="bg-card border rounded-lg p-3 shadow-lg">
                <code className="text-xs text-amber-400">class TreeNode:</code>
              </div>
            </div>
            <div className="absolute bottom-32 left-[20%] animate-float opacity-15">
              <div className="bg-card border rounded-lg p-3 shadow-lg">
                <code className="text-xs text-rose-400">// Binary Search</code>
              </div>
            </div>
            <div className="absolute bottom-40 right-[10%] animate-float-delayed opacity-15">
              <div className="bg-card border rounded-lg p-3 shadow-lg">
                <code className="text-xs text-blue-400">stack.push(node)</code>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-emerald-500/20 border border-primary/30 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-semibold">
                  Now with LeetCode Sync + XP System
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
                Master Algorithms
                <span className="block mt-2 bg-gradient-to-r from-primary via-amber-500 to-emerald-500 bg-clip-text text-transparent animate-gradient">
                  Never Forget Again
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Stop forgetting patterns. AlgoRecall uses <span className="text-foreground font-semibold">spaced repetition</span> to
                schedule your LeetCode reviews at optimal intervals for <span className="text-foreground font-semibold">maximum retention</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="h-14 px-10 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" asChild>
                  <Link href="/register">
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-2 hover:bg-secondary transition-all duration-300" asChild>
                  <Link href="/sign-in">
                    Log In
                  </Link>
                </Button>
              </div>

              <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Open Source</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y bg-card/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatItem number="10K+" label="Problems Tracked" icon={<Code2 className="h-5 w-5" />} />
              <StatItem number="5K+" label="Active Users" icon={<Users className="h-5 w-5" />} />
              <StatItem number="98%" label="Retention Rate" icon={<TrendingUp className="h-5 w-5" />} />
              <StatItem number="24/7" label="Sync Available" icon={<Clock className="h-5 w-5" />} />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to never forget a pattern again
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <StepCard
                step={1}
                title="Connect LeetCode"
                description="Link your LeetCode account and we'll automatically import all your solved problems."
                icon={<Zap className="h-8 w-8" />}
                color="from-blue-500 to-cyan-500"
              />
              <StepCard
                step={2}
                title="Get Smart Reminders"
                description="Our algorithm schedules reviews at optimal intervals: 1, 3, 7, 14, and 30 days."
                icon={<Calendar className="h-8 w-8" />}
                color="from-primary to-amber-500"
              />
              <StepCard
                step={3}
                title="Level Up"
                description="Earn XP, unlock achievements, and build streaks as you master each pattern."
                icon={<Trophy className="h-8 w-8" />}
                color="from-emerald-500 to-green-500"
              />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-gradient-to-b from-card/50 to-background border-t">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything You Need
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Powerful features to supercharge your algorithm practice
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <FeatureCard
                icon={<Brain className="h-6 w-6 text-primary" />}
                title="Smart Scheduling"
                description="Our algorithm calculates the perfect time for you to review a problem, maximizing retention with minimal effort."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6 text-amber-500" />}
                title="Instant Sync"
                description="Connect your LeetCode account to automatically import your solved problems and tracking history."
              />
              <FeatureCard
                icon={<Trophy className="h-6 w-6 text-emerald-500" />}
                title="XP & Leveling"
                description="Earn experience points for every review. Level up and unlock achievements as you progress."
              />
              <FeatureCard
                icon={<Star className="h-6 w-6 text-rose-500" />}
                title="Streak System"
                description="Build daily streaks to stay motivated. Don't break the chain and watch your consistency grow."
              />
              <FeatureCard
                icon={<TrendingUp className="h-6 w-6 text-blue-500" />}
                title="Activity Heatmap"
                description="Visualize your progress with a GitHub-style contribution graph showing your review activity."
              />
              <FeatureCard
                icon={<Sparkles className="h-6 w-6 text-purple-500" />}
                title="Achievements"
                description="Unlock badges for milestones like solving 100 problems, maintaining 30-day streaks, and more."
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 border-t">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Loved by Engineers
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of developers who've improved their interview prep
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <TestimonialCard
                quote="Finally, a tool that keeps my LeetCode practice on track. The spaced repetition is a game-changer."
                author="Sarah K."
                role="Software Engineer @ FAANG"
              />
              <TestimonialCard
                quote="I used to forget solutions within weeks. Now I can recall patterns even months later!"
                author="Michael C."
                role="Senior Developer"
              />
              <TestimonialCard
                quote="The XP system makes practicing fun. I actually look forward to my daily reviews now."
                author="Alex T."
                role="CS Student"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 border-t bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to Master Algorithms?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of developers using spaced repetition to ace their interviews.
              </p>
              <Button size="lg" className="h-14 px-12 text-lg font-semibold shadow-lg shadow-primary/25" asChild>
                <Link href="/register">
                  Get Started — It&apos;s Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">AlgoRecall</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="https://github.com" className="hover:text-foreground transition-colors">
                GitHub
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AlgoRecall. Open source and free.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatItem({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="text-primary">{icon}</div>
        <span className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
          {number}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function StepCard({ step, title, description, icon, color }: {
  step: number
  title: string
  description: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 rounded-2xl" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
      <div className="relative bg-card border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 h-full">
        <div className="text-xs font-bold text-primary mb-4">STEP {step}</div>
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} text-white mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="p-3 rounded-xl bg-secondary inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-card border rounded-2xl p-6 hover:border-primary/30 transition-colors duration-300">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-muted-foreground mb-4 leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}
