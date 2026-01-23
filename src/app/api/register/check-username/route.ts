import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")

    if (!username || username.length < 3) {
        return NextResponse.json({ available: false, error: "Username too short" })
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                usernameLower: username.toLowerCase()
            },
            select: { id: true }
        })

        return NextResponse.json({ available: !user })
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
