"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, BookOpen, Sparkles, Github, Linkedin, Twitter, Check, X, Users, Target, TrendingUp, ChevronDown } from "lucide-react"

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
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* Floating Code Elements - Hidden on very small screens */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5 hidden sm:block">
            <div className="absolute top-20 left-[10%] animate-float opacity-20">
              <div className="bg-card border border-border/50 rounded-lg p-2 sm:p-3 shadow-lg">
                <code className="text-[10px] sm:text-xs text-emerald-400">def twoSum(nums, target):</code>
              </div>
            </div>
            <div className="absolute top-40 right-[15%] animate-float-delayed opacity-20">
              <div className="bg-card border border-border/50 rounded-lg p-2 sm:p-3 shadow-lg">
                <code className="text-[10px] sm:text-xs text-primary">class TreeNode:</code>
              </div>
            </div>
            <div className="absolute bottom-32 left-[20%] animate-float opacity-15">
              <div className="bg-card border border-border/50 rounded-lg p-2 sm:p-3 shadow-lg">
                <code className="text-[10px] sm:text-xs text-rose-400">// Binary Search</code>
              </div>
            </div>
            <div className="absolute bottom-40 right-[10%] animate-float-delayed opacity-15">
              <div className="bg-card border border-border/50 rounded-lg p-2 sm:p-3 shadow-lg">
                <code className="text-[10px] sm:text-xs text-blue-400">stack.push(node)</code>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              From practice to mastering the{" "}
              <span className="text-primary">patterns</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed px-2">
              Dedicated to helping you retain algorithm patterns through spaced repetition,
              synced with your LeetCode progress.
            </p>

            {/* CTA */}
            <div className="pt-2 sm:pt-4">
              <Button
                size="lg"
                className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-medium rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
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
        <section className="py-8 sm:py-12 px-3 sm:px-4 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="rounded-xl border border-white/10 bg-[#0c0c0c] shadow-2xl overflow-hidden relative group">
              {/* Mock Browser Header */}
              <div className="h-8 sm:h-10 border-b border-white/5 bg-black/50 flex items-center px-3 sm:px-4 gap-2">
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/20" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-500/20" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500/20" />
                </div>
                <div className="flex-1 text-center text-[8px] sm:text-[10px] text-muted-foreground font-mono">
                  smarana.app/dashboard
                </div>
              </div>
              {/* Mock Content */}
              {/* Dashboard Preview Image */}
              <div className="relative aspect-[16/10] w-full bg-[#0c0c0c]">
                <Image
                  src="/image.png"
                  alt="Smarana Dashboard"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent h-40 bottom-0 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 sm:py-24 relative">
          <div className="container mx-auto px-3 sm:px-4 relative z-10">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">How it works</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Three simple steps to mastery</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
              {[
                { step: "01", title: "Solve Problems", desc: "Solve problems on LeetCode. We automatically sync your progress." },
                { step: "02", title: "Smart Scheduling", desc: "We calculate the optimal time for you to review based on forgetting curves." },
                { step: "03", title: "Review & Retain", desc: "Review problems with our guidance to lock patterns into long-term memory." }
              ].map((s, i) => (
                <div key={i} className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="text-2xl sm:text-4xl font-mono font-bold text-primary/20 mb-2 sm:mb-4">{s.step}</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Tatva Style */}
        <section className="py-12 sm:py-24 border-t border-border/50">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-2 sm:mb-4">
                Your Gateway to <span className="text-primary">Algorithm Mastery</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground text-center mb-8 sm:mb-16 max-w-xl mx-auto px-2">
                Smarana helps you remember what you learn through scientifically-proven
                spaced repetition techniques.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-6">
                <FeatureCard
                  icon={<Brain className="h-4 w-4 sm:h-5 sm:w-5" />}
                  title="Smart Scheduling"
                  description="Review problems at optimal intervals using spaced repetition algorithms."
                />
                <FeatureCard
                  icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
                  title="LeetCode Sync"
                  description="Automatically import your solved problems and track your progress."
                />
                <FeatureCard
                  icon={<BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />}
                  title="Pattern Recognition"
                  description="Group problems by patterns to build lasting intuition."
                />
                <FeatureCard
                  icon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}
                  title="XP & Streaks"
                  description="Stay motivated with gamification: earn XP and maintain streaks."
                />
              </div>
            </div>
          </div>
        </section>


        {/* Why Smarana Section */}
        <section className="py-12 sm:py-24 border-t border-border/50">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4">
                Why developers choose Smarana
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
                Stop forgetting solutions. Start building lasting problem-solving skills.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Problem card - stronger ember tint */}
                <div className="rounded-2xl border border-[#BB7331]/25 bg-gradient-to-b from-[#BB7331]/12 to-white/[0.02] p-5 sm:p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#BB7331]/35">
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white/80">
                      The <span className="text-[#BB7331]">Problem</span>
                    </h3>
                  </div>
                  <ul className="space-y-2.5 text-sm text-white/70">
                    {[
                      "Solve a problem, forget it a week later",
                      "Recognize patterns but can't recall solutions",
                      "Keep repeating the same \"easy\" mistakes",
                      "Interview prep feels like starting from scratch"
                    ].map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-[#BB7331]/70" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solution card - lighter ember tint for positive feel */}
                <div className="rounded-2xl border border-[#BB7331]/15 bg-gradient-to-b from-[#BB7331]/7 to-white/[0.02] p-5 sm:p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#BB7331]/25">
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white/80">
                      The <span className="text-[#BB7331]">Solution</span>
                    </h3>
                  </div>
                  <ul className="space-y-2.5 text-sm text-white/70">
                    {[
                      "Spaced repetition ensures long-term retention",
                      "Smart scheduling adjusts to what you review",
                      "Sync solved problems and track progress",
                      "Build a memory system for common patterns"
                    ].map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#BB7331]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section className="py-12 sm:py-24 border-t border-border/50">
          <div className="container mx-auto px-3 sm:px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
              Frequently asked questions
            </h2>
            <div className="max-w-2xl mx-auto space-y-4">
              <FAQItem
                question="How does spaced repetition work?"
                answer="Spaced repetition is a learning technique that schedules reviews at increasing intervals. When you solve a problem, we calculate the optimal time to review it based on your performance, ensuring you review just before you're likely to forget."
              />
              <FAQItem
                question="Do I need a LeetCode account?"
                answer="While Smarana works best with LeetCode sync, you can also manually add problems from any platform. The LeetCode integration automatically imports your solved problems and keeps your progress in sync."
              />
              <FAQItem
                question="Is Smarana free?"
                answer="Yes! Smarana is completely free to use. We believe everyone should have access to effective learning tools for technical interview preparation."
              />
              <FAQItem
                question="How is this different from Anki?"
                answer="Unlike Anki, Smarana is specifically designed for coding problems. It integrates with LeetCode, provides code-specific review interfaces, tracks your actual solutions, and understands the unique challenges of remembering algorithms and data structures."
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 border-t border-border/50 bg-gradient-to-t from-primary/10 to-transparent">
          <div className="container mx-auto px-3 sm:px-4 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              Ready to master algorithms?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of developers who are building lasting problem-solving skills.
            </p>
            <Button
              size="lg"
              className="h-12 px-8 text-base font-medium rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              asChild
            >
              <Link href="/register">
                Start Free Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer - Final Polished Style */}
      <footer className="py-12 sm:py-16 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-40" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">

            {/* Column 1: Brand & Tagline */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg overflow-hidden shadow-lg shadow-primary/20">
                  <Image
                    src="/logo.png"
                    alt="Smarana"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-xl tracking-tight">Smarana</span>
              </div>
              <p className="text-sm text-muted-foreground/90 font-medium italic leading-relaxed max-w-xs">
                "Remembrance is the root of knowledge"
              </p>

              <div className="flex items-center gap-3 text-sm text-white/50">
                <div className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center font-semibold text-white/70 hover:ring-1 hover:ring-[#BB7331]/30 transition">
                  JK
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href="https://x.com/jashkarangiya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md hover:bg-white/[0.04] hover:text-[#BB7331] transition"
                    aria-label="X"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href="https://github.com/jashkarangiya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md hover:bg-white/[0.04] hover:text-[#BB7331] transition"
                    aria-label="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  <a
                    href="https://linkedin.com/in/jashkarangiya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md hover:bg-white/[0.04] hover:text-[#BB7331] transition"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Resources */}
            <div className="space-y-4">
              <h4 className="font-medium text-white/90">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link href="/roadmap" className="hover:text-primary transition-colors">Roadmap</Link></li>
              </ul>
            </div>

            {/* Column 3: Platform */}
            <div className="space-y-4">
              <h4 className="font-medium text-white/90">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/problems" className="hover:text-primary transition-colors">All Problems</Link></li>
                <li><Link href="/review" className="hover:text-primary transition-colors">Review Session</Link></li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div className="space-y-4">
              <h4 className="font-medium text-white/90">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/60">
            <p>© {new Date().getFullYear()} Smarana Inc. All rights reserved.</p>

            <div className="flex items-center gap-2">
              <span>Designed with</span>
              <Sparkles className="h-3 w-3 text-primary/50" />
              <span>for developers</span>
            </div>
          </div>
        </div>
      </footer >
    </div >
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-sm sm:text-base mb-0.5 sm:mb-1">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}


function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group p-4 sm:p-5 rounded-xl border border-border/50 bg-card/30 cursor-pointer">
      <summary className="flex items-center justify-between font-medium text-sm sm:text-base list-none">
        {question}
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{answer}</p>
    </details>
  )
}
