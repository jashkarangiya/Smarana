import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { url } = await request.json()

        // Basic validation for LeetCode URLs
        if (!url.includes("leetcode.com/problems/")) {
            return NextResponse.json({ error: "Invalid LeetCode URL" }, { status: 400 })
        }

        const slug = url.split("leetcode.com/problems/")[1].split("/")[0]

        // In a real production app, we would scrape the metadata or use an official API.
        // For this MVP, we'll try to fetch correct title from GraphQL if possible,
        // otherwise default to formatting the slug.

        try {
            const response = await fetch("https://leetcode.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (compatible; Smarana/1.0)"
                },
                body: JSON.stringify({
                    query: `
                        query questionData($titleSlug: String!) {
                            question(titleSlug: $titleSlug) {
                                questionId
                                title
                                titleSlug
                                difficulty
                            }
                        }
                    `,
                    variables: { titleSlug: slug }
                })
            })

            const data = await response.json()
            const question = data.data?.question

            if (question) {
                return NextResponse.json({
                    title: question.title,
                    difficulty: question.difficulty,
                    slug: question.titleSlug,
                    url: `https://leetcode.com/problems/${question.titleSlug}/`
                })
            }
        } catch (e) {
            console.error("Failed to fetch LeetCode metadata", e)
        }

        // Fallback: format slug
        const title = slug
            .split("-")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

        return NextResponse.json({
            title,
            difficulty: "Medium", // Default if fetch fails
            slug,
            url
        })

    } catch (error) {
        console.error("Metadata fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
    }
}
