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

    // Check if this LeetCode username is already linked to another account
    const existingUser = await prisma.user.findFirst({
        where: {
            leetcodeUsername: leetcodeUsername,
            NOT: {
                email: session.user.email
            }
        }
    })

    if (existingUser) {
        return new NextResponse("This LeetCode username is already linked to another account", { status: 409 })
    }

    const user = await prisma.user.update({
        where: { email: session.user.email },
        data: { leetcodeUsername },
    })

    return NextResponse.json(user)
}
