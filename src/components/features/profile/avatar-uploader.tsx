"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploaderProps {
    currentImage?: string | null;
    name?: string | null;
    avatarSource?: "GOOGLE" | "UPLOAD" | "NONE";
}

export function AvatarUploader({ currentImage, name, avatarSource }: AvatarUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { update } = useSession();
    const [uploading, setUploading] = useState(false);
    const [resetting, setResetting] = useState(false);

    async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be smaller than 2MB");
            return;
        }

        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);

        try {
            const res = await fetch("/api/profile/avatar", {
                method: "POST",
                body: fd,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to upload image");
            }

            const data = await res.json();
            toast.success("Profile photo updated!");
            await update({ image: data.url });
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile photo");
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    async function handleReset() {
        if (!confirm("Are you sure you want to remove your custom avatar and revert to the default/Google one?")) return;

        setResetting(true);
        try {
            const res = await fetch("/api/profile/avatar/reset", {
                method: "POST",
            });

            if (!res.ok) throw new Error("Failed to reset avatar");

            toast.success("Avatar reset to default");
            await update(); // Trigger session refresh
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to reset avatar");
        } finally {
            setResetting(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative group">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-white/10 shadow-xl">
                    <AvatarImage
                        src={currentImage || ""}
                        className="object-cover transition-opacity group-hover:opacity-75"
                    />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading || resetting}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                        <Camera className="h-6 w-6 text-white" />
                    )}
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                />
            </div>

            {avatarSource === "UPLOAD" && (
                <Button
                    variant="ghost"
                    onClick={handleReset}
                    disabled={resetting || uploading}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2"
                >
                    {resetting ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                        <span className="flex items-center gap-1">Remove</span>
                    )}
                </Button>
            )}
        </div>
    );
}
