
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Verify this path
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
    title: "Admin Inbox",
};

export default async function AdminInboxPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/sign-in");
    }

    // Simple Admin Check
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    if (!adminEmails.includes(session.user.email)) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to view this page.</p>
                </div>
            </div>
        )
    }

    const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Inbox</h1>
                <Badge variant="outline">{messages.length} Messages</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-3 h-[600px]">
                {/* Message List */}
                <div className="md:col-span-1 border rounded-xl bg-card overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-muted/40">
                        <h2 className="font-semibold text-sm">Recent</h2>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col divide-y">
                            {messages.map((msg) => (
                                <div key={msg.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-medium ${msg.status === 'NEW' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {msg.status}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-sm truncate">{msg.subject}</h3>
                                    <p className="text-xs text-muted-foreground truncate">{msg.name}</p>
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No messages yet.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Message Detail (Simplified for MVP, just showing latest 5 fully or use client component for selection. 
            For now, let's keep it simple: Render list on left, and details of *all* formatted nicely in a scrollable right pane? 
            Or actually, I should make a Client Component for the Inbox to handle selection state.
            Let's stick to Server Component for now and just list them in a table-like view if safer, 
            OR make it a client component wrapper.
            To be fast: make it client component.)
        */}
                <InboxClient messages={messages} />
            </div>
        </div>
    );
}

// Client Component for interactivity
import { InboxClient } from "./inbox-client";
