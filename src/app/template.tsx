import { PageTransition } from "@/components/layout/page-transition"

export default function Template({ children }: { children: React.ReactNode }) {
    return <PageTransition>{children}</PageTransition>
}
