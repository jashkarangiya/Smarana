import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    // Trust Vercel's forwarding headers (Fixes auth on Vercel deployments)
    trustHost: true,
    debug: process.env.NODE_ENV === "development", // Enable debug logs in dev (or change to true temporarily if needed)
    pages: {
        signIn: "/sign-in",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    prompt: "select_account",
                },
            },
            profile(profile) {
                // Generate username from email (part before @)
                const username = profile.email.split("@")[0]
                // Create random suffix if needed (simple approach first)
                // Note: unique constraint might fail, ideally we handle this better
                // but for MVP this is acceptable or we add random suffix always.
                // Let's add 4 random digits to ensure uniqueness
                const randomSuffix = Math.floor(1000 + Math.random() * 9000)
                const uniqueUsername = `${username}${randomSuffix}`

                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    username: uniqueUsername,
                    usernameLower: uniqueUsername.toLowerCase(),
                    // Default stats
                    xp: 0,
                    level: 1,
                }
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials?.password) {
                    return null
                }

                // Try to find by email first, then username
                let user = await prisma.user.findUnique({
                    where: { email: credentials.identifier }
                })


                if (!user) {
                    user = await prisma.user.findUnique({
                        where: { username: credentials.identifier.toLowerCase() }
                    })
                }

                if (!user || !user.passwordHash) {
                    return null
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash)

                if (!isValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }: { token: any, user: any, trigger?: string, session?: any }) {
            // Initial sign in
            if (user) {
                const u = user as any
                token.id = u.id
                token.username = u.username
                token.leetcodeUsername = u.leetcodeUsername
                token.timezone = u.timezone
                token.picture = u.image
            }

            // Refetch fresh data from DB on every JWT access to ensure sync
            // This is critical for the "session refresh" flow after upload
            if (token.sub) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: { image: true, username: true, name: true, timezone: true }
                })
                if (dbUser) {
                    token.picture = dbUser.image
                    token.username = dbUser.username
                    token.name = dbUser.name
                    token.timezone = dbUser.timezone
                }
            }

            // Handle client-side updates
            if (trigger === "update" && session) {
                if (session.timezone) token.timezone = session.timezone
                if (session.username) token.username = session.username
                if (session.name) token.name = session.name
                if (session.image) token.picture = session.image
            }

            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token && session.user) {
                session.user.id = token.sub as string
                session.user.username = token.username as string
                session.user.leetcodeUsername = token.leetcodeUsername as string
                session.user.timezone = token.timezone as string
                session.user.image = token.picture as string
            }
            return session
        }
    },
    events: {
        async signIn({ user, account, profile }: { user: any, account: any, profile?: any }) {
            if (account?.provider === "google" && profile && "picture" in profile) {
                const p = profile as any

                // Fetch current source to avoid overwriting user-uploaded avatars
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { avatarSource: true },
                });

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleImageUrl: p.picture,
                        // Update effective image ONLY if user hasn't uploaded a custom one
                        ...(dbUser?.avatarSource !== "UPLOAD"
                            ? { image: p.picture, avatarSource: "GOOGLE", avatarUpdatedAt: new Date() }
                            : {}),
                        // Always update name from Google if we want, or maybe not? 
                        // Let's keep name sync for now as it was before, unless user edited it.
                        // Actually, let's play it safe and NOT overwrite name if it's set in DB?
                        // The previous logic overwrote it. Let's stick to the prompt's avatar focus.
                        // But if we want to be safe, we can sync name too. 
                        // Current logic: name: p.name || user.name
                        name: p.name || user.name
                    },
                })
            }
        },
    },
} as any
