import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { googleImageUrl: true, blobPathname: true },
        });

        // Reset to Google Image (or None)
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                avatarSource: user?.googleImageUrl ? "GOOGLE" : "NONE",
                image: user?.googleImageUrl ?? null,
                blobImageUrl: null,
                blobPathname: null,
                avatarUpdatedAt: new Date(),
            },
        });

        // Delete old blob
        if (user?.blobPathname) {
            del(user.blobPathname).catch(err => console.error("Failed to delete old blob:", err));
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Reset avatar error:", error);
        return NextResponse.json({ error: "Failed to reset avatar" }, { status: 500 });
    }
}
