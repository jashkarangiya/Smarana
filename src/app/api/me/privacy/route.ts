import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                profileVisibility: true,
                showStreakToPublic: true,
                showStreakToFriends: true,
                showPlatformsToPublic: true,
                showPlatformsToFriends: true,
                showBioPublicly: true,
                showTimezoneToPublic: true,
                showTimezoneToFriends: true,
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(user)

    } catch (error) {
        return handleApiError(error)
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const {
            profileVisibility,
            showStreakToPublic,
            showStreakToFriends,
            showPlatformsToPublic,
            showPlatformsToFriends,
            showBioPublicly,
            showTimezoneToPublic,
            showTimezoneToFriends,
        } = body

        // Validate profileVisibility
        if (profileVisibility && !["PUBLIC", "FRIENDS_ONLY", "PRIVATE"].includes(profileVisibility)) {
            return NextResponse.json({ error: "Invalid profile visibility" }, { status: 400 })
        }

        // Update privacy settings
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                profileVisibility: profileVisibility || undefined,
                showStreakToPublic: showStreakToPublic !== undefined ? showStreakToPublic : undefined,
                showStreakToFriends: showStreakToFriends !== undefined ? showStreakToFriends : undefined,
                showPlatformsToPublic: showPlatformsToPublic !== undefined ? showPlatformsToPublic : undefined,
                showPlatformsToFriends: showPlatformsToFriends !== undefined ? showPlatformsToFriends : undefined,
                showBioPublicly: showBioPublicly !== undefined ? showBioPublicly : undefined,
                showTimezoneToPublic: showTimezoneToPublic !== undefined ? showTimezoneToPublic : undefined,
                showTimezoneToFriends: showTimezoneToFriends !== undefined ? showTimezoneToFriends : undefined,
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        return handleApiError(error)
    }
}
