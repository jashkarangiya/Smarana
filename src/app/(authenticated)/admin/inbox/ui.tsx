"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Contact = {
    id: string;
    name: string | null;
    email: string;
    subject: string | null;
    message: string;
    status: string;
    createdAt: Date;
};

type Suggestion = {
    id: string;
    title: string;
    url: string;
    description: string | null;
    suggestedByEmail: string | null;
    status: string;
    createdAt: Date;
};

export function AdminInbox({
    contacts,
    suggestions,
}: {
    contacts: Contact[];
    suggestions: Suggestion[];
}) {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white/90">Admin Inbox</h1>
                <p className="mt-1 text-sm text-white/55">
                    Contact form submissions and resource suggestions.
                </p>
            </div>

            <Tabs defaultValue="contact">
                <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="contact">
                        Contact
                        <span className="ml-2 text-xs text-white/50">({contacts.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="resources">
                        Resource Suggestions
                        <span className="ml-2 text-xs text-white/50">({suggestions.length})</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="contact" className="mt-4">
                    <div className="grid gap-4">
                        {contacts.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-center text-white/40">
                                No contact messages yet.
                            </div>
                        ) : (
                            contacts.map((m) => (
                                <Card key={m.id} className="border-white/10 bg-white/5">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <CardTitle className="text-base text-white/90">
                                                    {m.subject || "No subject"}
                                                </CardTitle>
                                                <CardDescription className="text-sm text-white/55">
                                                    {m.name ? `${m.name} • ` : ""}
                                                    {m.email} • {new Date(m.createdAt).toLocaleString()}
                                                </CardDescription>
                                            </div>

                                            <Badge className="bg-white/5 text-white/70 ring-1 ring-white/10">
                                                {m.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-white/70 whitespace-pre-wrap">
                                            {m.message}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-4">
                    <div className="grid gap-4">
                        {suggestions.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-center text-white/40">
                                No resource suggestions yet.
                            </div>
                        ) : (
                            suggestions.map((s) => (
                                <Card key={s.id} className="border-white/10 bg-white/5">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <CardTitle className="text-base text-white/90">
                                                    {s.title}
                                                </CardTitle>
                                                <CardDescription className="text-sm text-white/55">
                                                    {s.suggestedByEmail ? `${s.suggestedByEmail} • ` : ""}
                                                    {new Date(s.createdAt).toLocaleString()}
                                                </CardDescription>
                                            </div>

                                            <Badge className="bg-white/5 text-white/70 ring-1 ring-white/10">
                                                {s.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-2">
                                        <a
                                            href={s.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm text-[#BB7331] hover:underline break-all"
                                        >
                                            {s.url}
                                        </a>

                                        {s.description ? (
                                            <p className="text-sm text-white/70 whitespace-pre-wrap">
                                                {s.description}
                                            </p>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
