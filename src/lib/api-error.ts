import { NextResponse } from "next/server"
import { z } from "zod"

export function handleApiError(error: unknown) {
    console.error("API Error:", error)

    // Zod Validation Errors
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: error.issues[0].message, details: error.flatten() },
            { status: 400 }
        )
    }

    // Prisma Unique Constraint Violation
    if ((error as any).code === 'P2002') {
        return NextResponse.json(
            { error: "Resource already exists (unique constraint violation)" },
            { status: 409 }
        )
    }

    // Prisma Record Not Found
    if ((error as any).code === 'P2025') {
        return NextResponse.json(
            { error: "Resource not found" },
            { status: 404 }
        )
    }

    // Standard Error object
    if (error instanceof Error) {
        // Return clean message if safe, otherwise generic
        // For security, we might want to hide specific implementation details in prod
        // But for this MVP, returning the message is helpful for debugging
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }

    // Fallback
    return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
    )
}
