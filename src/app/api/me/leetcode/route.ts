import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { leetcodeUsername } = await req.json()

    if (!leetcodeUsername) {
        return new NextResponse("Username is required", { status: 400 })
    }

    const user = await prisma.user.update({
        where: { email: session.user.email },
        data: { leetcodeUsername },
    })

    return NextResponse.json(user)
}
