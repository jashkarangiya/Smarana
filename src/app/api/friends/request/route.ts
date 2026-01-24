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
            return new NextResponse("Missing recipient identifier", { status: 400 })
        }

        const searchTerm = recipientUsername.trim()

        if (searchTerm.toLowerCase() === session.user.username?.toLowerCase()) {
            return new NextResponse("Cannot add yourself", { status: 400 })
        }

        // Search by username (case-insensitive) OR exact name match
        const recipient = await prisma.user.findFirst({
            where: {
                OR: [
                    { usernameLower: searchTerm.toLowerCase() },
                    { name: { equals: searchTerm, mode: 'insensitive' } }
                ]
            }
        })

        if (!recipient) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Prevent adding yourself (check again after finding user)
        if (recipient.id === session.user.id) {
            return new NextResponse("Cannot add yourself", { status: 400 })
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

        // Create request and notification in a transaction
        await prisma.$transaction([
            prisma.friendRequest.create({
                data: {
                    senderId: session.user.id,
                    receiverId: recipient.id,
                    status: "PENDING"
                }
            }),
            prisma.notification.create({
                data: {
                    userId: recipient.id,
                    type: "FRIEND_REQUEST_RECEIVED",
                    actorId: session.user.id,
                    title: `${session.user.name || session.user.username} sent you a friend request`,
                    href: "/friends"
                }
            })
        ])

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Friend request error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
