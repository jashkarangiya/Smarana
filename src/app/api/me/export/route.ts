
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        const userData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                leetcodeUsername: true,
                xp: true,
                level: true,
                createdAt: true,
                problems: true,
                reviewLogs: true,
            }
        })

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            user: userData
        }

        return NextResponse.json(exportData)

    } catch (error) {
        console.error("Export error:", error)
        return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
    }
}
