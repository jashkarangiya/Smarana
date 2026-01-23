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

        const { requestId, action } = await req.json() // action: "ACCEPT" | "DECLINE"

        if (!requestId || !action) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        const request = await prisma.friendRequest.findUnique({
            where: { id: requestId },
            include: { sender: true }
        })

        if (!request) {
            return new NextResponse("Request not found", { status: 404 })
        }

        if (request.receiverId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        if (action === "DECLINE") {
            await prisma.friendRequest.delete({
                where: { id: requestId }
            })
            return NextResponse.json({ success: true, status: "DECLINED" })
        }

        if (action === "ACCEPT") {
            // Transaction to create bidirectional friendship and delete request
            await prisma.$transaction([
                // Create A -> B
                prisma.friendship.create({
                    data: {
                        userId: request.senderId,
                        friendId: request.receiverId
                    }
                }),
                // Create B -> A
                prisma.friendship.create({
                    data: {
                        userId: request.receiverId,
                        friendId: request.senderId
                    }
                }),
                // Delete request
                prisma.friendRequest.delete({
                    where: { id: requestId }
                })
            ])

            return NextResponse.json({ success: true, status: "ACCEPTED" })
        }

        return new NextResponse("Invalid action", { status: 400 })

    } catch (error) {
        console.error("Friend response error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
