import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminInbox } from "./ui";

function isAdmin(email?: string | null) {
    if (!email) return false;
    const list = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    return list.includes(email.toLowerCase());
}

export default async function AdminInboxPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/sign-in");
    if (!isAdmin(session.user.email)) notFound(); // looks like 404 to non-admins

    const [contacts, suggestions] = await Promise.all([
        prisma.contactMessage.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
                id: true,
                name: true,
                email: true,
                subject: true,
                message: true,
                status: true,
                createdAt: true,
            },
        }),
        prisma.resourceSuggestion.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
                id: true,
                title: true,
                url: true,
                description: true,
                suggestedByEmail: true,
                status: true,
                createdAt: true,
            },
        }),
    ]);

    return <AdminInbox contacts={contacts} suggestions={suggestions} />;
}
