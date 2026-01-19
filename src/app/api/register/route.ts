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

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email
        })

    } catch (error) {
        console.error("Registration error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
