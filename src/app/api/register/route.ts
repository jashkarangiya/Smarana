import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        if (!email || !password) {
            return new NextResponse("Missing email or password", { status: 400 })
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return new NextResponse("User already exists", { status: 400 })
        }

        // Generate username from name if not provided (fallback)
        // For now we just use the name or email part
        let baseUsername = name?.split(' ')[0].toLowerCase() || email.split('@')[0].toLowerCase()
        // Improve: Sanitize username
        baseUsername = baseUsername.replace(/[^a-z0-9_]/g, '')

        // Ensure uniqueness (simple approach for now: append random number if taken)
        // In a real flow, frontend should provide username
        let username = baseUsername
        let isUnique = false
        let attempts = 0

        while (!isUnique && attempts < 5) {
            const check = await prisma.user.findUnique({
                where: { usernameLower: username.toLowerCase() }
            })
            if (!check) {
                isUnique = true
            } else {
                username = `${baseUsername}${Math.floor(Math.random() * 10000)}`
            }
            attempts++
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                passwordUpdatedAt: new Date(),
                username: username,
                usernameLower: username.toLowerCase(),
                usernameChangedAt: new Date(),
                usernameChangeCount: 0
            },
        })

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username
        })

    } catch (error) {
        console.error("Registration error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
