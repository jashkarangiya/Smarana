import { renderEmailLayout } from "../layout"

const escapeHtml = (s: string) =>
    s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")

export function contestReminderEmail(params: {
    appUrl: string
    logoUrl: string
    username?: string | null
    platform: string
    contestName: string
    startTimeLocal: string
    startInText: string
    contestUrl: string
}) {
    const subject = `Contest reminder: ${params.contestName}`

    const greeting = params.username?.trim()
        ? `Hey ${escapeHtml(params.username.trim())},`
        : "Hey,"

    const childrenHtml = `
    <p style="margin:0 0 12px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#cfcfda;font-size:14px;line-height:1.6;">
      ${greeting}
    </p>
    <p style="margin:0 0 14px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#cfcfda;font-size:14px;line-height:1.6;">
      <b>${escapeHtml(params.contestName)}</b> on <b>${escapeHtml(params.platform)}</b> starts <b>${escapeHtml(params.startInText)}</b>.
    </p>

    <div style="margin:14px 0 14px 0;padding:14px;background:#0c0c10;border:1px solid #1f1f26;border-radius:14px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:6px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#8b8b96;font-size:13px;">
            Starts:
          </td>
          <td style="padding-bottom:6px;padding-left:12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#ffffff;font-size:13px;font-weight:600;">
            ${escapeHtml(params.startTimeLocal)}
          </td>
        </tr>
        <tr>
          <td style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#8b8b96;font-size:13px;">
            Platform:
          </td>
          <td style="padding-left:12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#ffffff;font-size:13px;font-weight:600;">
            ${escapeHtml(params.platform)}
          </td>
        </tr>
      </table>
    </div>

    <div style="margin:16px 0 10px 0;">
      <a href="${params.contestUrl}"
         style="display:inline-block;background:#24242c;color:#ffffff;text-decoration:none;border:1px solid #33333d;
                font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
                font-weight:600;font-size:14px;padding:12px 18px;border-radius:14px;">
        View Contest
      </a>
    </div>
  `

    const html = renderEmailLayout({
        preheader: `${params.platform} • starts ${params.startInText}`,
        title: "Contest reminder",
        appUrl: params.appUrl,
        logoUrl: params.logoUrl,
        childrenHtml,
        footerHtml: "You can disable contest reminders from Settings.",
    })

    const text = [
        greeting,
        "",
        `${params.contestName} on ${params.platform} starts ${params.startInText}.`,
        `Start time: ${params.startTimeLocal}`,
        `Contest link: ${params.contestUrl}`,
        "",
        "You can disable contest reminders from Settings.",
    ].join("\n")

    return { subject, html, text }
}
