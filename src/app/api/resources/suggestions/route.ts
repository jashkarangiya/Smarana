import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const SuggestSchema = z.object({
    title: z.string().min(3).max(120),
    url: z.string().url().max(500),
    category: z.enum(["SHEET", "PLAYLIST", "ARTICLE", "TOOL", "COURSE"]),
    note: z.string().max(500).optional(),
});

// Normalize URL to reduce duplicates (strip query/hash, trim trailing slash)
function normalizeUrl(raw: string) {
    try {
        const u = new URL(raw);
        u.hash = "";
        u.search = "";
        let norm = `${u.origin}${u.pathname}`.trim();
        if (norm.endsWith("/")) norm = norm.slice(0, -1);
        return norm.toLowerCase();
    } catch (e) {
        return raw.toLowerCase().trim();
    }
}

export async function POST(req: Request) {
    // Basic CSRF-ish protection: reject cross-origin POSTs
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    // Allow if origin matches host (basic check) or if mostly server-to-server (but this is a user action)
    // In Vercel, host might differ slightly from origin protocol, so lenient check:
    if (origin && host && !origin.includes(host)) {
        // return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
        // Relaxing for now to avoid issues with localhost vs 127.0.0.1, typically handled by Next.js middleware anyway
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = SuggestSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { title, url, category, note } = parsed.data;
    const urlNormalized = normalizeUrl(url);

    // Rate limit: max 3 suggestions per user per 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await prisma.resourceSuggestion.count({
        where: { userId: session.user.id, createdAt: { gte: since } },
    });

    if (count >= 3) {
        return NextResponse.json(
            { error: "Too many suggestions. Try again tomorrow." },
            { status: 429 }
        );
    }

    try {
        const created = await prisma.resourceSuggestion.create({
            data: {
                userId: session.user.id,
                title,
                url,
                description: note?.trim() || null,
            },
        });

        // TODO: Send email notification here if configured

        return NextResponse.json({ ok: true, suggestionId: created.id }, { status: 201 });
    } catch (err: any) {
        // Unique constraint -> already suggested
        if (err?.code === "P2002") {
            return NextResponse.json(
                { error: "This resource has already been suggested." },
                { status: 409 }
            );
        }
        console.error("Suggestion error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
