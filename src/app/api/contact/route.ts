
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
// Rate limit handled via DB
// Actually, strict DB check is better if no redis.
// "rate limit (don’t add a new dependency: just DB-check by ipHash)"

// Schema
const contactSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(3, "Subject too short").max(120, "Subject too long"),
    message: z.string().min(10, "Message too short").max(4000, "Message too long"),
    // Honeypot
    company: z.string().optional(),
});

// Helper to hash IP
async function hashIp(ip: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Honeypot check
        // If 'company' is filled, it's a bot. Return success but do nothing.
        if (body.company) {
            return NextResponse.json({ success: true });
        }

        // 2. Validation
        const result = contactSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, subject, message } = result.data;
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const ipHash = await hashIp(ip);

        // 3. Rate Limit (DB check)
        // Max 3 messages per hour per IP hash
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentCount = await prisma.contactMessage.count({
            where: {
                ipHash: ipHash,
                createdAt: { gt: oneHourAgo }
            }
        });

        if (recentCount >= 3) {
            return NextResponse.json(
                { error: "Too many messages. Please try again later." },
                { status: 429 }
            );
        }

        // 4. Store
        await prisma.contactMessage.create({
            data: {
                name,
                email,
                subject,
                message,
                ipHash,
                userAgent: req.headers.get("user-agent") || undefined,
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Contact Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
