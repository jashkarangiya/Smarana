import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminInbox() {
    const session = await getServerSession(authOptions);

    // Admin Protection
    if (session?.user?.email !== "jashkarangiya@gmail.com") {
        redirect("/");
    }

    const msgs = await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
    });

    return (
        <div className="mx-auto max-w-5xl px-6 py-10">
            <h1 className="text-2xl font-semibold text-white/90">Admin Inbox</h1>
            <p className="mt-1 text-sm text-white/50">Contact form messages</p>

            <div className="mt-6 space-y-3">
                {msgs.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-center text-white/40">
                        No messages yet.
                    </div>
                ) : (
                    msgs.map((m) => (
                        <div key={m.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-white/90 font-medium">{m.subject || "(No subject)"}</div>
                                    <div className="text-white/50 text-sm">{m.email}</div>
                                </div>
                                <div className="text-white/40 text-xs">
                                    {new Date(m.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="mt-3 text-white/70 text-sm line-clamp-2">{m.message}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
