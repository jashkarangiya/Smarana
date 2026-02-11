import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/sendEmail"
import { resetPasswordEmail } from "@/lib/email/templates/resetPassword"
import { reviewReminderEmail } from "@/lib/email/templates/reviewReminder"
import { remindContestEmail } from "@/lib/email/templates/contestReminder"
import { getBaseUrl } from "@/lib/baseUrl"

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get("type")
    const to = searchParams.get("email")

    if (!to) {
        return NextResponse.json({ error: "Missing 'email' query param" }, { status: 400 })
    }

    const appUrl = getBaseUrl()
    const logoUrl = `${appUrl}/brand/logo-email.png`

    let emailContent: { subject: string, html: string, text: string }

    switch (type) {
        case "reset":
            emailContent = resetPasswordEmail({
                appUrl,
                logoUrl,
                userName: "Test User",
                resetUrl: `${appUrl}/reset-password?token=test-token`,
                expiresMinutes: 15,
            })
            break

        case "review":
            emailContent = reviewReminderEmail({
                appUrl,
                logoUrl,
                username: "Test User",
                dueCount: 5,
                reviewUrl: `${appUrl}/review`,
            })
            break

        case "review-empty":
            emailContent = reviewReminderEmail({
                appUrl,
                logoUrl,
                username: "Test User",
                dueCount: 0,
                reviewUrl: `${appUrl}/review`,
            })
            break

        case "contest":
            emailContent = remindContestEmail({
                appUrl,
                openSmaranaUrl: `${appUrl}/contests`,
                settingsUrl: `${appUrl}/settings`,
                userName: "Test User",
                platform: "LeetCode",
                contestName: "Weekly Contest 400",
                startsAtLabel: "Sunday, 10:30 AM",
                startsInLabel: "in 2 days",
                contestUrl: "https://leetcode.com/contest/weekly-contest-400",
            })
            break

        default:
            return NextResponse.json({
                error: "Invalid type. Use: reset, review, review-empty, contest",
                availableTypes: ["reset", "review", "review-empty", "contest"]
            }, { status: 400 })
    }

    try {
        await sendEmail({
            to,
            subject: `[TEST] ${emailContent.subject}`,
            html: emailContent.html,
            text: emailContent.text,
        })
        return NextResponse.json({ success: true, message: `Sent ${type} email to ${to}` })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
