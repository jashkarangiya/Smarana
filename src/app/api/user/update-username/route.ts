import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { addDays, isAfter } from "date-fns"

const COOLDOWN_DAYS = 90

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { username } = await req.json()

        if (!username || username.length < 3 || username.length > 20) {
            return new NextResponse("Invalid username length", { status: 400 })
        }

        if (!/^[a-z0-9_]+$/.test(username)) {
            return new NextResponse("Invalid characters", { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Check if username is taken
        const existing = await prisma.user.findUnique({
            where: { usernameLower: username.toLowerCase() }
        })

        if (existing && existing.id !== user.id) {
            return new NextResponse("Username already taken", { status: 400 })
        }

        // COOLDOWN LOGIC
        if (user.usernameChangeCount > 0 && user.usernameChangedAt) {
            const nextAllowed = addDays(user.usernameChangedAt, COOLDOWN_DAYS)
            if (!isAfter(new Date(), nextAllowed)) {
                return new NextResponse(`You can change your username again after ${nextAllowed.toLocaleDateString()}`, { status: 403 })
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                username: username,
                usernameLower: username.toLowerCase(),
                usernameChangedAt: new Date(),
                usernameChangeCount: { increment: 1 }
            }
        })

        return NextResponse.json({ success: true, username })

    } catch (error) {
        console.error("Update username error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
