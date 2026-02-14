import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const schema = z.object({
    timezone: z.string().min(1).max(64),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { timezone: parsed.data.timezone },
    });

    return NextResponse.json({ ok: true });
}
