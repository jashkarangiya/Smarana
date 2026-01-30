"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

type Category = "SHEET" | "PLAYLIST" | "ARTICLE" | "TOOL" | "COURSE";

export function SuggestResourceDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [category, setCategory] = useState<Category>("SHEET");
    const [note, setNote] = useState("");

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/resources/suggestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, url, category, note: note || undefined }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed");
            return data;
        },
        onSuccess: () => {
            toast.success("Thanks! Your suggestion was sent to the admins.");
            setTitle("");
            setUrl("");
            setNote("");
            setCategory("SHEET");
            setOpen(false);
        },
        onError: (e: any) => {
            toast.error(e?.message || "Could not send suggestion");
        },
    });

    const disabled = mutation.isPending || title.trim().length < 3 || url.trim().length < 8;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-[#BB7331] text-black hover:bg-[#BB7331]/90 font-medium">
                    <Plus className="h-4 w-4" />
                    Suggest Resource
                </Button>
            </DialogTrigger>

            <DialogContent className="border-white/10 bg-[#0A0A0A] text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Suggest a resource</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-white/70">Title</div>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. NeetCode 150"
                            className="bg-white/5 border-white/10 focus-visible:ring-[#BB7331]/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium text-white/70">Link</div>
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-white/5 border-white/10 focus-visible:ring-[#BB7331]/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium text-white/70">Category</div>
                        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                            <SelectTrigger className="bg-white/5 border-white/10 focus:ring-[#BB7331]/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border-white/10">
                                <SelectItem value="SHEET">Sheet</SelectItem>
                                <SelectItem value="PLAYLIST">Playlist</SelectItem>
                                <SelectItem value="ARTICLE">Article</SelectItem>
                                <SelectItem value="TOOL">Tool</SelectItem>
                                <SelectItem value="COURSE">Course</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium text-white/70">Why is it helpful? (optional)</div>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Short note about why this resource is valuable..."
                            className="min-h-[100px] bg-white/5 border-white/10 focus-visible:ring-[#BB7331]/50 resize-none"
                        />
                    </div>

                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={disabled}
                        className="w-full rounded-lg bg-[#BB7331] text-black hover:bg-[#BB7331]/90 font-medium mt-2"
                    >
                        {mutation.isPending ? "Sending..." : "Send suggestion"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
