import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { encrypt, safeDecrypt } from "@/lib/encryption"

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return new NextResponse("User not found", { status: 404 })
    }

    const problem = await prisma.revisionProblem.findUnique({
        where: { id: params.id },
    })

    if (!problem || problem.userId !== user.id) {
        return new NextResponse("Problem not found", { status: 404 })
    }

    const body = await req.json()
    const { notes, solution } = body

    // Encrypt sensitive fields before storing
    const updated = await prisma.revisionProblem.update({
        where: { id: problem.id },
        data: {
            ...(notes !== undefined && { notes: encrypt(notes) }),
            ...(solution !== undefined && { solution: encrypt(solution) }),
        },
    })

    // Decrypt before returning
    return NextResponse.json({
        ...updated,
        notes: safeDecrypt(updated.notes),
        solution: safeDecrypt(updated.solution),
    })
}

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return new NextResponse("User not found", { status: 404 })
    }

    const problem = await prisma.revisionProblem.findUnique({
        where: { id: params.id },
        select: {
            id: true,
            title: true,
            notes: true,
            solution: true,
        },
    })

    if (!problem) {
        return new NextResponse("Problem not found", { status: 404 })
    }

    // Decrypt sensitive fields before returning
    return NextResponse.json({
        ...problem,
        notes: safeDecrypt(problem.notes),
        solution: safeDecrypt(problem.solution),
    })
}
