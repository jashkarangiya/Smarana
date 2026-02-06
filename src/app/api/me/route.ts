import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    return NextResponse.json(user)
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, bio, timezone } = body

        // Validate bio length
        if (bio !== undefined && bio.length > 160) {
            return NextResponse.json(
                { error: "Bio must be 160 characters or less" },
                { status: 400 }
            )
        }

        // Validate name
        if (name !== undefined && name.trim().length === 0) {
            return NextResponse.json(
                { error: "Name cannot be empty" },
                { status: 400 }
            )
        }

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(bio !== undefined && { bio: bio.trim() || null }),
                ...(timezone !== undefined && { timezone }),
                ...(body.emailReviewRemindersEnabled !== undefined && { emailReviewRemindersEnabled: body.emailReviewRemindersEnabled }),
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("Failed to update user:", error)
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}
