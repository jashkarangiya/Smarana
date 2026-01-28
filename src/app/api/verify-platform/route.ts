import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
    generateVerificationToken,
    fetchPlatformProfile,
    checkTokenInBio,
    PLATFORM_INSTRUCTIONS,
    type Platform
} from "@/lib/platform-fetchers"

const SUPPORTED_PLATFORMS = ["leetcode", "codeforces", "codechef", "atcoder"] as const

/**
 * POST /api/verify-platform
 * Generate a verification token for a platform
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { platform, username } = await req.json()

        // Validate platform
        if (!SUPPORTED_PLATFORMS.includes(platform)) {
            return NextResponse.json(
                { error: `Unsupported platform. Must be one of: ${SUPPORTED_PLATFORMS.join(", ")}` },
                { status: 400 }
            )
        }

        // Validate username
        if (!username || typeof username !== "string" || username.length < 1) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 })
        }

        // Check if the platform profile exists
        const profile = await fetchPlatformProfile(platform as Platform, username)
        if (!profile.exists) {
            return NextResponse.json(
                { error: profile.error || `User '${username}' not found on ${platform}` },
                { status: 404 }
            )
        }

        // Generate token and store
        const token = generateVerificationToken()
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        const verification = await prisma.platformVerification.upsert({
            where: {
                userId_platform: {
                    userId: session.user.id,
                    platform
                }
            },
            create: {
                userId: session.user.id,
                platform,
                username,
                verificationToken: token,
                tokenExpiresAt: expiresAt,
                isVerified: false
            },
            update: {
                username,
                verificationToken: token,
                tokenExpiresAt: expiresAt,
                isVerified: false,
                verifiedAt: null
            }
        })

        const instructions = PLATFORM_INSTRUCTIONS[platform as Platform]

        return NextResponse.json({
            token,
            expiresAt,
            instructions,
            verificationId: verification.id
        })

    } catch (error) {
        console.error("POST /api/verify-platform error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

/**
 * PUT /api/verify-platform
 * Check if the verification token is present in the user's bio
 */
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { platform } = await req.json()

        // Validate platform
        if (!SUPPORTED_PLATFORMS.includes(platform)) {
            return NextResponse.json(
                { error: `Unsupported platform. Must be one of: ${SUPPORTED_PLATFORMS.join(", ")}` },
                { status: 400 }
            )
        }

        // Get the pending verification
        const verification = await prisma.platformVerification.findUnique({
            where: {
                userId_platform: {
                    userId: session.user.id,
                    platform
                }
            }
        })

        if (!verification) {
            return NextResponse.json(
                { error: "No verification pending for this platform. Please generate a token first." },
                { status: 404 }
            )
        }

        // Check if already verified
        if (verification.isVerified) {
            return NextResponse.json({
                verified: true,
                verifiedAt: verification.verifiedAt,
                username: verification.username
            })
        }

        // Check if token expired
        if (verification.tokenExpiresAt < new Date()) {
            return NextResponse.json(
                { error: "Verification token has expired. Please generate a new one." },
                { status: 410 }
            )
        }

        // Fetch the profile and check for token
        const profile = await fetchPlatformProfile(platform as Platform, verification.username)

        if (!profile.exists) {
            return NextResponse.json(
                { error: profile.error || `User '${verification.username}' not found on ${platform}` },
                { status: 404 }
            )
        }

        const hasToken = checkTokenInBio(profile.bio, verification.verificationToken)

        if (hasToken) {
            // Update verification status
            await prisma.platformVerification.update({
                where: { id: verification.id },
                data: {
                    isVerified: true,
                    verifiedAt: new Date()
                }
            })

            return NextResponse.json({
                verified: true,
                verifiedAt: new Date(),
                username: verification.username
            })
        } else {
            // Check what's in the bio for debugging
            const instructions = PLATFORM_INSTRUCTIONS[platform as Platform]

            return NextResponse.json({
                verified: false,
                message: `Token not found in your ${instructions.field}. Make sure you've added the exact token: ${verification.verificationToken}`,
                token: verification.verificationToken,
                bioContent: profile.bio ? `Found bio: "${profile.bio.substring(0, 100)}..."` : "No bio found"
            })
        }

    } catch (error) {
        console.error("PUT /api/verify-platform error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

/**
 * GET /api/verify-platform
 * Get verification status for all platforms
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const verifications = await prisma.platformVerification.findMany({
            where: { userId: session.user.id },
            select: {
                platform: true,
                username: true,
                isVerified: true,
                verifiedAt: true
            }
        })

        // Convert to a map for easier access
        const statusMap: Record<string, { username: string; isVerified: boolean; verifiedAt: Date | null }> = {}
        for (const v of verifications) {
            statusMap[v.platform] = {
                username: v.username,
                isVerified: v.isVerified,
                verifiedAt: v.verifiedAt
            }
        }

        return NextResponse.json(statusMap)

    } catch (error) {
        console.error("GET /api/verify-platform error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
