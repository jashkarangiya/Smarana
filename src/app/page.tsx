"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Footer } from "@/components/layout/footer"
import { ArrowRight, Brain, BookOpen, Sparkles, Check, X, Users, Target, TrendingUp } from "lucide-react"

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
        <section className="min-h-screen flex flex-col items-center justify-center relative px-4 py-12 lg:py-0">
          {/* Subtle Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* Floating Code Elements - Responsive (2 mobile, 4 desktop, 6 large) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
            {/* 1. Visible on ALL screens (Mobile: Top Left) */}
            <div className="absolute top-24 left-4 sm:top-20 sm:left-[10%] animate-float opacity-50">
              <div className="bg-card/80 border border-white/10 rounded-lg p-3 shadow-lg backdrop-blur-sm">
                <code className="text-xs text-emerald-400 font-semibold">def twoSum(nums, target):</code>
              </div>
            </div>

            {/* 2. Visible on ALL screens (Mobile: Bottom Right) */}
            <div className="absolute bottom-28 right-4 sm:bottom-40 sm:right-[10%] animate-float-delayed opacity-50">
              <div className="bg-card/80 border border-white/10 rounded-lg p-3 shadow-lg backdrop-blur-sm">
                <code className="text-xs text-blue-400 font-semibold">stack.push(node)</code>
              </div>
            </div>

            {/* 3. Visible on Desktop+ (md) */}
            <div className="absolute top-40 right-[15%] animate-float-delayed opacity-50 hidden md:block">
              <div className="bg-card/80 border border-white/10 rounded-lg p-3 shadow-lg backdrop-blur-sm">
                <code className="text-xs text-primary font-semibold">class TreeNode:</code>
              </div>
            </div>

            {/* 4. Visible on Desktop+ (md) */}
            <div className="absolute bottom-32 left-[20%] animate-float opacity-40 hidden md:block">
              <div className="bg-card/80 border border-white/10 rounded-lg p-3 shadow-lg backdrop-blur-sm">
                <code className="text-xs text-rose-400 font-semibold">{"// Binary Search"}</code>
              </div>
            </div>

            {/* 5. Visible on Large Screens+ (xl) */}
            <div className="absolute top-1/2 left-[5%] -translate-y-1/2 animate-float opacity-40 hidden xl:block">
              <div className="bg-card/80 border border-white/10 rounded-lg p-3 shadow-lg backdrop-blur-sm">
                <code className="text-xs text-amber-400 font-semibold">dp[i][j] = dp[i-1][j]</code>
              </div>
            </div>

            {/* 6. Visible on Large Screens+ (xl) */}
            <div className="absolute top-1/3 right-[5%] animate-float-delayed opacity-40 hidden xl:block">
              <div className="bg-card/80 border border-white/10 rounded-lg p-3 shadow-lg backdrop-blur-sm">
                <code className="text-xs text-cyan-400 font-semibold">graph.add_edge(u, v)</code>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
            {/* Main Heading */}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-white/90 sm:text-5xl lg:text-7xl leading-[1.1]">
              From practice to mastering the{" "}
              <span className="text-primary">patterns</span>
            </h1>

            {/* Subheading */}
            <p className="mt-4 max-w-prose mx-auto text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground">
              Dedicated to helping you retain algorithm patterns through spaced repetition,
              synced with your favorite coding platforms.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="group h-11 w-full sm:w-auto px-8 text-base font-medium rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-[#BB7331] text-white hover:bg-[#BB7331]/90"
                asChild
              >
                <Link href="/register">
                  Start Learning
                  <span className="ml-2 inline-block transition-transform duration-150 group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Product Preview Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
          <div className="mx-auto w-full max-w-6xl relative">
            {/* Orange Aura Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[60%] bg-[#BB7331]/20 blur-[100px] -z-10 rounded-full opacity-50 pointer-events-none mix-blend-screen" />

            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
              <Image
                src="/823_1x_shots_so.png"
                alt="Smarana Dashboard"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 sm:py-16 lg:py-24 relative">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">How it works</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Three simple steps to mastery</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { step: "01", title: "Solve Problems", desc: "Solve problems on LeetCode, Codeforces, AtCoder, or CodeChef. We sync your progress." },
                { step: "02", title: "Smart Scheduling", desc: "We calculate the optimal time for you to review based on forgetting curves." },
                { step: "03", title: "Review & Retain", desc: "Review problems with our guidance to lock patterns into long-term memory." }
              ].map((s, i) => (
                <div key={i} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 hover:bg-white/[0.04] transition-colors">
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-primary/20 mb-3">{s.step}</div>
                  <h3 className="text-lg font-semibold mb-2 text-white/85">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-24 border-t border-border/50">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4">
                Your Gateway to <span className="text-primary">Algorithm Mastery</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-prose mx-auto">
                Smarana helps you remember what you learn through scientifically-proven
                spaced repetition techniques.
              </p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<Brain className="h-5 w-5" />}
                title="Smart Scheduling"
                description="Review problems at optimal intervals using spaced repetition algorithms."
              />
              <FeatureCard
                icon={<Sparkles className="h-5 w-5" />}
                title="Platform Sync"
                description="Import solved problems from LeetCode, Codeforces, and more."
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
        </section>

        {/* Why Smarana Section */}
        <section className="py-12 sm:py-16 lg:py-24 border-t border-border/50">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                Why developers choose Smarana
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-prose mx-auto">
                Stop forgetting solutions. Start building lasting problem-solving skills.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Problem card */}
              <div className="rounded-2xl border border-[#BB7331]/25 bg-gradient-to-b from-[#BB7331]/12 to-white/[0.02] p-5 sm:p-8">
                <h3 className="text-sm font-semibold text-[#BB7331] mb-4 uppercase tracking-wider">The Problem</h3>
                <ul className="space-y-3 text-sm text-white/70">
                  {[
                    "Solve a problem, forget it a week later",
                    "Recognize patterns but can't recall solutions",
                    "Keep repeating the same \"easy\" mistakes",
                    "Interview prep feels like starting from scratch"
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-[#BB7331]/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solution card */}
              <div className="rounded-2xl border border-[#BB7331]/15 bg-gradient-to-b from-[#BB7331]/7 to-white/[0.02] p-5 sm:p-8">
                <h3 className="text-sm font-semibold text-[#BB7331] mb-4 uppercase tracking-wider">The Solution</h3>
                <ul className="space-y-3 text-sm text-white/70">
                  {[
                    "Spaced repetition ensures long-term retention",
                    "Smart scheduling adjusts to what you review",
                    "Sync solved problems and track progress",
                    "Build a memory system for common patterns"
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#BB7331]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection>
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-10 sm:mb-16">
              Frequently asked questions
            </h2>
            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {[
                  {
                    q: "How does spaced repetition work?",
                    a: "Spaced repetition is a learning technique that schedules reviews at increasing intervals. When you solve a problem, we calculate the optimal time to review it based on your performance, ensuring you review just before you're likely to forget."
                  },
                  {
                    q: "Which platforms are supported?",
                    a: "Smarana supports LeetCode, Codeforces, AtCoder, and CodeChef. Connect your account to automatically sync your solved problems, or manually add problems from any source."
                  },
                  {
                    q: "Is Smarana free?",
                    a: "Yes! Smarana is completely free to use. We believe everyone should have access to effective learning tools for technical interview preparation."
                  },
                  {
                    q: "How is this different from Anki?",
                    a: "Unlike Anki, Smarana is specifically designed for coding problems. It integrates with major competitive programming platforms, provides code-specific review interfaces, tracks your solutions, and understands the unique challenges of remembering algorithms."
                  }
                ].map((faq) => (
                  <AccordionItem
                    key={faq.q}
                    value={faq.q}
                    className="overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur transition data-[state=open]:border-[#BB7331]/30 data-[state=open]:bg-black/35 data-[state=open]:shadow-[0_0_0_4px_rgba(187,115,49,0.10)]"
                  >
                    <AccordionTrigger
                      className="group flex w-full items-center justify-between px-5 py-4 text-left text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB7331]/30 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-[#BB7331]/80"
                    >
                      <span className="pr-6">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent
                      className="overflow-hidden px-5 pb-4 text-white/65 leading-relaxed data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up motion-reduce:animate-none"
                    >
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </FAQSection>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 border-t border-border/50 bg-gradient-to-t from-primary/10 to-transparent">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              Ready to master algorithms?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of developers who are building lasting problem-solving skills.
            </p>
            <Button
              size="lg"
              className="group h-12 w-full sm:w-auto px-8 text-base font-medium rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-[#BB7331] text-white hover:bg-[#BB7331]/90"
              asChild
            >
              <Link href="/register">
                Start Free Today
                <span className="ml-2 inline-block transition-transform duration-150 group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer - Final Polished Style */}
      <Footer />
    </div >
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-5 sm:p-6 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors h-full">
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-base mb-1 text-white/90">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}


function FAQSection({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      className="py-12 sm:py-16 lg:py-24 border-t border-border/50"
      initial={reduce ? undefined : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}
