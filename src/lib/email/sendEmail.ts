import nodemailer from "nodemailer"

export const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function sendEmail(params: {
    to: string
    subject: string
    html: string
    text: string
}) {
    const from = process.env.EMAIL_FROM || `Smarana <${process.env.SMTP_USER}>`

    await mailer.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: process.env.SMTP_USER,
    })
}
