import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { recipientUsername } = await req.json()

        if (!recipientUsername) {
            return new NextResponse("Missing recipient username", { status: 400 })
        }

        if (recipientUsername === session.user.username) {
            return new NextResponse("Cannot add yourself", { status: 400 })
        }

        const recipient = await prisma.user.findUnique({
            where: { username: recipientUsername }
        })

        if (!recipient) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Check if request already exists
        const existingRequest = await prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: session.user.id,
                    receiverId: recipient.id
                }
            }
        })

        if (existingRequest) {
            return new NextResponse("Request already sent", { status: 400 })
        }

        // Check if already friends
        const existingFriendship = await prisma.friendship.findUnique({
            where: {
                userId_friendId: {
                    userId: session.user.id,
                    friendId: recipient.id
                }
            }
        })

        if (existingFriendship) {
            return new NextResponse("Already friends", { status: 400 })
        }

        // Create request
        await prisma.friendRequest.create({
            data: {
                senderId: session.user.id,
                receiverId: recipient.id,
                status: "PENDING"
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Friend request error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
