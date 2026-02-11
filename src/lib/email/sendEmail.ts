import nodemailer from "nodemailer"
import path from "path"

export const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

/**
 * The CID used for the inline logo attachment.
 * Use this in email HTML as: <img src="cid:smarana-logo" />
 */
export const LOGO_CID = "smarana-logo"

export async function sendEmail(params: {
    to: string
    subject: string
    html: string
    text: string
}) {
    const from = process.env.EMAIL_FROM || `Smarana <${process.env.SMTP_USER}>`

    // Resolve logo path — works in both Next.js (process.cwd() = project root) and scripts
    const logoPath = path.join(process.cwd(), "public", "brand", "logo-email.png")

    await mailer.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: process.env.SMTP_USER,
        attachments: [
            {
                filename: "logo-email.png",
                path: logoPath,
                cid: LOGO_CID,
            },
        ],
    })
}
