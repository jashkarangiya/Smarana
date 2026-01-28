import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Debug endpoint to test database connectivity on Vercel
// DELETE THIS FILE AFTER DEBUGGING
export async function GET() {
    try {
        // Test 1: Basic connection
        const result = await prisma.$queryRaw`SELECT 1 as test`

        // Test 2: Check if User table exists and count
        const userCount = await prisma.user.count()

        // Test 3: Check if Account table exists
        const accountCount = await prisma.account.count()

        // Test 4: Check environment variables (masked)
        const envCheck = {
            DATABASE_URL: process.env.DATABASE_URL ? "SET (length: " + process.env.DATABASE_URL.length + ")" : "NOT SET",
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET (length: " + process.env.NEXTAUTH_SECRET.length + ")" : "NOT SET",
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
            GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
        }

        return NextResponse.json({
            success: true,
            database: {
                connected: true,
                userCount,
                accountCount,
            },
            environment: envCheck,
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            errorName: error.name,
            stack: error.stack?.split("\n").slice(0, 5),
        }, { status: 500 })
    }
}
