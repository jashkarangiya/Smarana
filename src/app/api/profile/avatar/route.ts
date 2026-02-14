import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 415 });
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 413 });
    }

    try {
        const ext = file.type.split("/")[1] ?? "png";
        const pathname = `avatars/${session.user.id}/${Date.now()}.${ext}`;
        const blob = await put(
            pathname,
            file,
            { access: "public" }
        );

        // Fetch user to get old blob pathname for deletion
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { blobPathname: true }
        });

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                image: blob.url,
                avatarSource: "UPLOAD",
                blobImageUrl: blob.url,
                blobPathname: pathname,
                avatarUpdatedAt: new Date(),
            },
        });

        // Best-effort cleanup of old blob
        if (user?.blobPathname) {
            del(user.blobPathname).catch(err => console.error("Failed to delete old blob:", err));
        }

        return NextResponse.json({ ok: true, url: blob.url });
    } catch (error) {
        console.error("Upload error detailed:", error);
        return NextResponse.json({ error: "Upload failed: " + (error as Error).message }, { status: 500 });
    }
}
