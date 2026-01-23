import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const SettingsSchema = z.object({
    focusDuration: z.number().min(5).max(120),
    shortBreakDuration: z.number().min(1).max(30),
    longBreakDuration: z.number().min(5).max(60),
    longBreakInterval: z.number().min(1).max(10),
    autoStartBreaks: z.boolean(),
    autoStartPomodoros: z.boolean(),
})

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        // Get or create default settings
        let settings = await prisma.pomodoroSettings.findUnique({
            where: { userId: session.user.id }
        })

        if (!settings) {
            settings = await prisma.pomodoroSettings.create({
                data: {
                    userId: session.user.id,
                }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error("GET pomodoro settings error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const result = SettingsSchema.safeParse(body)

        if (!result.success) {
            return new NextResponse("Invalid settings", { status: 400 })
        }

        const settings = await prisma.pomodoroSettings.upsert({
            where: { userId: session.user.id },
            update: result.data,
            create: {
                userId: session.user.id,
                ...result.data
            }
        })

        return NextResponse.json(settings)

    } catch (error) {
        console.error("UPDATE pomodoro settings error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
