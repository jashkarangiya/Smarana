import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminResourcesPage() {
    const session = await getServerSession(authOptions);

    // Admin Protection
    if (session?.user?.email !== "jashkarangiya@gmail.com") {
        redirect("/");
    }

    const suggestions = await prisma.resourceSuggestion.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { user: { select: { name: true, email: true } } }
    });

    return (
        <div className="mx-auto max-w-5xl px-6 py-10">
            <h1 className="text-2xl font-semibold text-white/90">Resource Suggestions</h1>
            <p className="mt-1 text-sm text-white/50">Community submitted resources</p>

            <div className="mt-6 space-y-3">
                {suggestions.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-center text-white/40">
                        No suggestions yet.
                    </div>
                ) : (
                    suggestions.map((s) => (
                        <div key={s.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-white/90 font-medium">{s.title}</h3>
                                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#BB7331] text-sm hover:underline break-all block">
                                        {s.url}
                                    </a>
                                    {s.description && (
                                        <p className="text-white/70 text-sm mt-1">{s.description}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-xs text-white/40 block">
                                        {new Date(s.createdAt).toLocaleDateString()}
                                    </span>
                                    {s.user && (
                                        <span className="text-xs text-white/30 block mt-1">
                                            by {s.user.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
