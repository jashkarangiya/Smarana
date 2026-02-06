import { renderEmailLayout } from "../layout"

const escapeHtml = (s: string) =>
    s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")

export function reviewReminderEmail(params: {
    appUrl: string
    logoUrl: string
    username?: string | null
    dueCount: number
    reviewUrl: string
}) {
    const subject =
        params.dueCount === 0
            ? "You’re all caught up 🎉"
            : `You have ${params.dueCount} review${params.dueCount === 1 ? "" : "s"} due`

    const greeting = params.username?.trim()
        ? `Hey ${escapeHtml(params.username.trim())},`
        : "Hey,"

    const childrenHtml =
        params.dueCount === 0
            ? `
        <p style="margin:0 0 12px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#cfcfda;font-size:14px;line-height:1.6;">
          ${greeting}
        </p>
        <p style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#cfcfda;font-size:14px;line-height:1.6;">
          No reviews due right now. Nice work — your future self says thanks.
        </p>
      `
            : `
        <p style="margin:0 0 12px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#cfcfda;font-size:14px;line-height:1.6;">
          ${greeting}
        </p>
        <p style="margin:0 0 14px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#cfcfda;font-size:14px;line-height:1.6;">
          You’ve got <strong style="color:#ffffff;">${params.dueCount}</strong> problem${params.dueCount === 1 ? "" : "s"} due for review.
        </p>
        
        <div style="margin:14px 0 14px 0;padding:12px 14px;background:#1a150e;border:1px solid #3d2610;border-radius:14px;">
           <p style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#d4cfc9;font-size:13px;line-height:1.5;">
             <strong style="color:#BB7331;">Tip:</strong> A 5–10 minute review streak beats a 2-hour weekend panic session.
           </p>
        </div>

        <div style="margin:16px 0 10px 0;">
          <a href="${params.reviewUrl}"
             style="display:inline-block;background:#BB7331;color:#0b0b0d;text-decoration:none;
                    font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
                    font-weight:800;font-size:14px;padding:12px 18px;border-radius:14px;">
            Start Review Session
          </a>
        </div>
      `

    const html = renderEmailLayout({
        preheader: params.dueCount === 0 ? "No reviews due." : `${params.dueCount} reviews waiting for you.`,
        title: params.dueCount === 0 ? "All caught up" : "Reviews due today",
        appUrl: params.appUrl,
        logoUrl: params.logoUrl,
        childrenHtml,
        footerHtml: "You can disable email reminders anytime from Settings.",
    })

    const text =
        params.dueCount === 0
            ? [
                greeting,
                "",
                "No reviews due right now. Nice work.",
                `${params.appUrl}/dashboard`,
            ].join("\n")
            : [
                greeting,
                "",
                `You have ${params.dueCount} reviews due.`,
                "Start here:",
                params.reviewUrl,
                "",
                "You can disable email reminders from Settings.",
            ].join("\n")

    return { subject, html, text }
}
