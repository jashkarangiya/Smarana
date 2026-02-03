import { Metadata } from "next";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
    title: "FAQ",
    description: "Frequently asked questions about Smarana.",
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
        <div className="space-y-12 max-w-3xl">
            <section>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Frequently <span className="text-[#BB7331]">Asked Questions</span>
                </h1>
                <p className="mt-4 text-white/65 leading-relaxed">
                    Everything you need to know about Smarana and our spaced repetition system.
                </p>
            </section>

            <section>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 rounded-xl bg-white/[0.02] px-4">
                            <AccordionTrigger className="hover:no-underline hover:text-[#BB7331] text-left">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-white/60 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>
        </div>
    );
}
