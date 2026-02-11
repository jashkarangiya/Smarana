import { renderEmailLayout } from "../layout"

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

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

  const brand = {
    text: "#1C1D21",
    muted: "#5B5E66",
    soft: "#F7F7FA",
    border: "#E7E7EC",
    gold: "#BB7331",
  }

  const childrenHtml =
    params.dueCount === 0
      ? `
        <div style="margin-top:14px; font-size:16px; line-height:1.6; color:${brand.text};">
          ${greeting}
        </div>
        <div style="margin-top:10px; font-size:16px; line-height:1.6; color:${brand.text};">
          No reviews due right now. Nice work — your future self says thanks.
        </div>
      `
      : `
        <div style="margin-top:14px; font-size:16px; line-height:1.6; color:${brand.text};">
          ${greeting}
        </div>
        <div style="margin-top:10px; font-size:16px; line-height:1.6; color:${brand.text};">
          You’ve got <strong style="color:${brand.gold};">${params.dueCount}</strong> problem${params.dueCount === 1 ? "" : "s"} due for review.
        </div>
        
        <div style="margin:16px 0 16px 0; padding:12px 14px; background:${brand.soft}; border:1px solid ${brand.border}; border-radius:14px;">
           <div style="margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; color:${brand.muted}; font-size:13px; line-height:1.5;">
             <strong style="color:${brand.text};">Tip:</strong> A 5–10 minute review streak beats a 2-hour weekend panic session.
           </div>
        </div>

        <div style="margin:18px 0 10px 0;">
          <a href="${params.reviewUrl}"
             style="display:inline-block; background:${brand.gold}; color:#111; text-decoration:none;
                    font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
                    font-weight:800; font-size:14px; padding:12px 18px; border-radius:14px; border:1px solid rgba(0,0,0,0.08);">
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
    cardFooterHtml: "You can disable email reminders anytime from Settings.",
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
