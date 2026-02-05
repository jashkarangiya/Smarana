"use client"

import { useState } from "react"
import { ContactMessage } from "@prisma/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Mail, Clock, User, Globe, Hash } from "lucide-react"
import { format } from "date-fns"

interface InboxClientProps {
    messages: ContactMessage[]
}

export function InboxClient({ messages }: InboxClientProps) {
    const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id || null)

    const selectedMessage = messages.find(m => m.id === selectedId)

    return (
        <>
            {/* Message List (Mobile: Full width if no selection or overlay? For MVP: Grid side-by-side) */}
            <div className="md:col-span-1 border rounded-xl bg-card overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b bg-muted/40">
                    <h2 className="font-semibold text-sm">Messages</h2>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col divide-y">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => setSelectedId(msg.id)}
                                className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer group ${selectedId === msg.id ? "bg-muted relative" : ""}`}
                            >
                                {selectedId === msg.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                )}
                                <div className="flex items-center justify-between mb-1">
                                    <Badge variant={msg.status === 'NEW' ? 'default' : 'secondary'} className="text-[10px] px-1.5 h-5">
                                        {msg.status}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">
                                        {format(new Date(msg.createdAt), 'MMM d')}
                                    </span>
                                </div>
                                <h3 className={`font-medium text-sm truncate mt-1 ${msg.status === 'NEW' ? 'text-foreground' : 'text-muted-foreground'}`}>{msg.subject}</h3>
                                <p className="text-xs text-muted-foreground truncate">{msg.name}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Message View */}
            <div className="md:col-span-2 border rounded-xl bg-card overflow-hidden h-full flex flex-col">
                {selectedMessage ? (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="p-6 border-b bg-muted/10 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="text-xl font-semibold leading-tight">{selectedMessage.subject}</h2>
                                <Badge variant="outline">{selectedMessage.status}</Badge>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="text-foreground font-medium">{selectedMessage.name}</span>
                                    <span>&lt;{selectedMessage.email}&gt;</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{format(new Date(selectedMessage.createdAt), "PPpp")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-mono bg-muted/30 p-4 rounded-lg border border-white/5">
                                {selectedMessage.message}
                            </div>

                            {/* Metadata Footer */}
                            {(selectedMessage.ipHash || selectedMessage.userAgent) && (
                                <div className="mt-8 pt-6 border-t border-white/5 grid gap-2 text-xs text-muted-foreground/50">
                                    {selectedMessage.ipHash && (
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-3 w-3" />
                                            <span className="font-mono">IP: {selectedMessage.ipHash.substring(0, 12)}...</span>
                                        </div>
                                    )}
                                    {selectedMessage.userAgent && (
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-3 w-3" />
                                            <span className="truncate max-w-md" title={selectedMessage.userAgent}>{selectedMessage.userAgent}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                        <Mail className="h-12 w-12 opacity-20 mb-4" />
                        <p>Select a message to view details</p>
                    </div>
                )}
            </div>
        </>
    )
}
