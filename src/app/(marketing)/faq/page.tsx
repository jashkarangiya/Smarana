import { Metadata } from "next";
import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "FAQ",
    description: "Answers to common questions about Smarana.",
};

const faqs = [
    {
        question: "How does the spaced repetition work?",
        answer: "Smarana uses an algorithm inspired by SuperMemo-2 (SM-2). When you review a problem, you rate its difficulty. Based on your rating, we calculate the optimal time for you to review it again—just before you're likely to forget it."
    },
    {
        question: "Do I code the solutions directly in Smarana?",
        answer: "No. Smarana is a companion tool. You track your progress here, but you solve the problems on LeetCode, HackerRank, or your platform of choice. We provide the schedule; you do the work."
    },
    {
        question: "Is this free?",
        answer: "Yes, Smarana is currently free to use while in beta."
    },
    {
        question: "Can I import my LeetCode history?",
        answer: "We are working on tighter integrations. Currently, you can manually add problems or use our focused Adding flow. Automated import features are on the roadmap."
    },
    {
        question: "Why can't I specificy exact review dates?",
        answer: "The philosophy of spaced repetition is that the system manages the interval based on your performance. Trusting the algorithm usually yields better long-term retention than manual scheduling."
    }
]

export default function FAQPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* HERO */}
            <Card className="relative overflow-hidden border-white/10 bg-white/[0.03] p-8 md:p-10">
                <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,#BB7331_0%,transparent_55%)]" />
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                    Frequently <span className="text-[#BB7331]">Asked</span> Questions
                </h1>
                <p className="mt-3 max-w-2xl text-white/60 text-lg">
                    Everything you need to know about Smarana and how the spaced repetition flow works.
                </p>
            </Card>

            {/* FAQ LIST */}
            <Card className="border-white/10 bg-white/[0.03] overflow-hidden">
                <Accordion type="single" collapsible className="divide-y divide-white/10">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="px-6 border-b-0">
                            <AccordionTrigger className="py-5 text-left text-white/90 hover:text-white hover:no-underline data-[state=open]:text-[#BB7331] transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="pb-5 text-white/60 leading-relaxed max-w-3xl">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </Card>

            {/* Support Callout */}
            <Card className="border-white/10 bg-white/[0.03] p-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-white/70">
                    Still have questions? Reach out to us directly.
                </p>
                <Link href="/contact" className="text-sm font-medium text-[#BB7331] hover:text-[#BB7331]/80 hover:underline transition-colors">
                    Contact Support &rarr;
                </Link>
            </Card>
        </div>
    );
}
