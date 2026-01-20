import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { imageUrl } = await request.json()

        if (!imageUrl || typeof imageUrl !== "string") {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
        }

        // Basic URL validation
        try {
            new URL(imageUrl)
        } catch {
            return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
        }

        // Update avatar
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { image: imageUrl },
        })

        return NextResponse.json({
            success: true,
            image: updatedUser.image,
        })
    } catch (error) {
        console.error("Avatar update error:", error)
        return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 })
    }
}
