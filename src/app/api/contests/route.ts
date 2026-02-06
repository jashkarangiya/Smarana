import { NextResponse } from "next/server"
import { fetchAllContests } from "@/lib/contests/fetchers"

export async function GET() {
    try {
        const contests = await fetchAllContests()
        return NextResponse.json({ contests })
    } catch {
        return NextResponse.json({ contests: [] }, { status: 200 })
    }
}
