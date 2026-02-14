import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const schema = z.object({
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3)
        .max(20)
        .regex(/^[a-z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            username: true,
            usernameChangedAt: true,
            usernameChangeCount: true,
        },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const lastChanged = user.usernameChangedAt ? new Date(user.usernameChangedAt) : null;
    const daysSinceChange = lastChanged ? Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    const canChange = !lastChanged || daysSinceChange >= 90;
    const daysUntilChange = canChange ? 0 : 90 - daysSinceChange;

    return NextResponse.json({
        username: user.username,
        canChange,
        daysUntilChange,
    });
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Username must be 3-20 characters (a-z, 0-9, _)" },
            { status: 400 }
        );
    }

    const username = parsed.data.username;

    // Check if username is taken
    const existing = await prisma.user.findUnique({
        where: { username },
    });

    if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    // Check if user is allowed to change username
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { usernameChangedAt: true },
    });

    if (user?.usernameChangedAt) {
        const lastChanged = new Date(user.usernameChangedAt);
        const now = new Date();
        const daysSinceChange = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceChange < 90) {
            return NextResponse.json(
                { error: `You can change your username again in ${90 - daysSinceChange} days` },
                { status: 403 }
            );
        }
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            username,
            usernameLower: username.toLowerCase(),
            usernameChangedAt: new Date(),
            usernameChangeCount: { increment: 1 }
        },
    });

    return NextResponse.json({ ok: true, username });
}
