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
        async jwt({ token, user }) {
            if (user) {
                const u = user as any
                token.username = u.username
                token.leetcodeUsername = u.leetcodeUsername
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string
                session.user.username = token.username as string
                session.user.leetcodeUsername = token.leetcodeUsername as string
            }
            return session
        },
    },
}
