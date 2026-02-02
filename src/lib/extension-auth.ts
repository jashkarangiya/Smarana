import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Token expiration times
export const ACCESS_TOKEN_EXPIRY_HOURS = 1
export const REFRESH_TOKEN_EXPIRY_DAYS = 30
export const AUTH_CODE_EXPIRY_MINUTES = 5

/**
 * Generate a secure random token
 */
export function generateToken(prefix: string = ""): string {
    const randomBytes = crypto.randomBytes(32).toString("hex")
    return prefix ? `${prefix}_${randomBytes}` : randomBytes
}

/**
 * Generate access and refresh tokens for an extension session
 */
export function generateTokenPair() {
    return {
        accessToken: generateToken("ext_acc"),
        refreshToken: generateToken("ext_ref"),
    }
}

/**
 * Generate a one-time authorization code
 */
export function generateAuthCode(): string {
    return generateToken("ext_code")
}

/**
 * Validate an extension access token and return the user ID if valid
 */
export async function validateExtensionToken(
    request: Request
): Promise<{ userId: string; tokenId: string } | null> {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader?.startsWith("Bearer ")) {
        return null
    }

    const accessToken = authHeader.slice(7) // Remove "Bearer " prefix

    if (!accessToken.startsWith("ext_acc_")) {
        return null
    }

    const tokenRecord = await prisma.extensionToken.findUnique({
        where: { accessToken },
        select: {
            id: true,
            userId: true,
            expiresAt: true,
        },
    })

    if (!tokenRecord) {
        return null
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
        return null
    }

    // Update last used timestamp (fire and forget)
    prisma.extensionToken
        .update({
            where: { id: tokenRecord.id },
            data: { lastUsedAt: new Date() },
        })
        .catch(() => {
            // Ignore errors from updating lastUsedAt
        })

    return {
        userId: tokenRecord.userId,
        tokenId: tokenRecord.id,
    }
}

/**
 * Validate an extension refresh token and return the token record if valid
 */
export async function validateRefreshToken(refreshToken: string) {
    if (!refreshToken.startsWith("ext_ref_")) {
        return null
    }

    const tokenRecord = await prisma.extensionToken.findUnique({
        where: { refreshToken },
        select: {
            id: true,
            userId: true,
            expiresAt: true,
        },
    })

    if (!tokenRecord) {
        return null
    }

    // Refresh tokens don't expire but we still check for sanity
    return tokenRecord
}

/**
 * Create a new extension token pair for a user
 */
export async function createExtensionTokens(userId: string) {
    const { accessToken, refreshToken } = generateTokenPair()

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + ACCESS_TOKEN_EXPIRY_HOURS)

    // Delete any existing tokens for this user (one session at a time)
    await prisma.extensionToken.deleteMany({
        where: { userId },
    })

    // Create new token record
    const token = await prisma.extensionToken.create({
        data: {
            userId,
            accessToken,
            refreshToken,
            expiresAt,
        },
    })

    return {
        accessToken,
        refreshToken,
        expiresAt: token.expiresAt.toISOString(),
    }
}

/**
 * Refresh an access token using a refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
    const tokenRecord = await validateRefreshToken(refreshToken)

    if (!tokenRecord) {
        return null
    }

    // Generate new access token
    const newAccessToken = generateToken("ext_acc")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + ACCESS_TOKEN_EXPIRY_HOURS)

    // Update the token record with new access token
    await prisma.extensionToken.update({
        where: { id: tokenRecord.id },
        data: {
            accessToken: newAccessToken,
            expiresAt,
            lastUsedAt: new Date(),
        },
    })

    return {
        accessToken: newAccessToken,
        expiresAt: expiresAt.toISOString(),
    }
}

/**
 * Revoke all extension tokens for a user
 */
export async function revokeExtensionTokens(userId: string) {
    await prisma.extensionToken.deleteMany({
        where: { userId },
    })
}

/**
 * Create a one-time authorization code for the extension connect flow
 */
export async function createAuthCode(userId: string, state: string) {
    const code = generateAuthCode()

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + AUTH_CODE_EXPIRY_MINUTES)

    // Delete any existing unused codes for this user
    await prisma.extensionAuthCode.deleteMany({
        where: {
            userId,
            usedAt: null,
        },
    })

    await prisma.extensionAuthCode.create({
        data: {
            userId,
            code,
            state,
            expiresAt,
        },
    })

    return code
}

/**
 * Exchange an authorization code for tokens
 */
export async function exchangeAuthCode(code: string) {
    const codeRecord = await prisma.extensionAuthCode.findUnique({
        where: { code },
        select: {
            id: true,
            userId: true,
            expiresAt: true,
            usedAt: true,
            user: {
                select: {
                    username: true,
                    email: true,
                },
            },
        },
    })

    if (!codeRecord) {
        return { error: "Invalid code" }
    }

    if (codeRecord.usedAt) {
        return { error: "Code already used" }
    }

    if (codeRecord.expiresAt < new Date()) {
        return { error: "Code expired" }
    }

    // Mark code as used
    await prisma.extensionAuthCode.update({
        where: { id: codeRecord.id },
        data: { usedAt: new Date() },
    })

    // Create tokens
    const tokens = await createExtensionTokens(codeRecord.userId)

    return {
        ...tokens,
        user: {
            username: codeRecord.user.username,
            email: codeRecord.user.email,
        },
    }
}

/**
 * Clean up expired auth codes (can be called periodically)
 */
export async function cleanupExpiredAuthCodes() {
    await prisma.extensionAuthCode.deleteMany({
        where: {
            OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
        },
    })
}
