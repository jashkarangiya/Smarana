import type { ReactNode } from "react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-16">{children}</main>
            <Footer />
        </div>
    );
}
