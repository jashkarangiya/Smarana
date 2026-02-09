import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SuggestSchema = z.object({
    title: z.string().trim().min(2).max(120),
    url: z.string().trim().url().max(500),
    description: z.string().trim().max(800).optional().or(z.literal("")),
    email: z.string().trim().email().max(254).optional().or(z.literal("")),
    website: z.string().optional(), // honeypot
});

function getClientIp(req: Request) {
    return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function hashIp(ip: string) {
    const salt = process.env.IP_HASH_SALT ?? "dev";
    return crypto.createHash("sha256").update(ip + salt).digest("hex");
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    const body = await req.json().catch(() => null);
    const parsed = SuggestSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (parsed.data.website) {
        return NextResponse.json({ ok: true });
    }

    const ipHash = hashIp(getClientIp(req));
    const userAgent = req.headers.get("user-agent") ?? undefined;

    // max 10 suggestions/hour per IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.resourceSuggestion.count({
        where: { ipHash, createdAt: { gt: oneHourAgo } },
    });
    if (recentCount >= 10) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    await prisma.resourceSuggestion.create({
        data: {
            title: parsed.data.title,
            url: parsed.data.url,
            description: parsed.data.description || null,
            suggestedByEmail: parsed.data.email || session?.user?.email || null,
            userId: session?.user?.id ?? null,
            status: "NEW",
            ipHash,
            userAgent,
        },
    });

    return NextResponse.json({ ok: true });
}
