import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { safeDecrypt } from "@/lib/encryption"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const problem = await prisma.revisionProblem.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        })

        if (!problem) {
            return NextResponse.json({ error: "Problem not found" }, { status: 404 })
        }

        // Decrypt sensitive fields
        return NextResponse.json({
            ...problem,
            notes: safeDecrypt(problem.notes),
            solution: safeDecrypt(problem.solution),
        })
    } catch (error) {
        console.error("Get problem error:", error)
        return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 })
    }
}
