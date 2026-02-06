import { renderEmailLayout } from "../layout"

type PasswordResetEmailArgs = {
  appUrl: string
  logoUrl: string
  userName?: string | null
  resetUrl: string
  expiresMinutes: number
}

const escapeHtml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

export function resetPasswordEmail({
  appUrl,
  logoUrl,
  userName,
  resetUrl,
  expiresMinutes,
}: PasswordResetEmailArgs) {
  const greeting = userName?.trim()
    ? `Hey ${escapeHtml(userName.trim())},`
    : "Hey,"

  const title = "Reset your password"
  const subject = "Reset your Smarana password"

  const childrenHtml = `
    <p style="margin:0 0 12px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#cfcfda;font-size:14px;line-height:1.6;">
      ${greeting}
    </p>

    <p style="margin:0 0 14px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#cfcfda;font-size:14px;line-height:1.6;">
      We received a request to reset your Smarana password. Click the button below to choose a new one.
    </p>

    <div style="margin:14px 0 14px 0;padding:12px 14px;background:#0c0c10;border:1px solid #1f1f26;border-radius:14px;">
      <p style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#a3a3ad;font-size:13px;line-height:1.5;">
        This link expires in <strong style="color:#ffffff;">${expiresMinutes} minutes</strong>.
      </p>
    </div>

    <div style="margin:16px 0 10px 0;">
      <a href="${resetUrl}"
         style="display:inline-block;background:#BB7331;color:#0b0b0d;text-decoration:none;
                font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
                font-weight:800;font-size:14px;padding:12px 18px;border-radius:14px;">
        Reset Password
      </a>
    </div>

    <p style="margin:14px 0 6px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#a3a3ad;font-size:12px;line-height:1.6;">
      If the button doesn’t work, copy and paste this link:
    </p>

    <p style="margin:0 0 16px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;
              color:#BB7331;font-size:12px;line-height:1.5;word-break:break-all;">
      <a href="${resetUrl}" style="color:#BB7331;text-decoration:underline;">${resetUrl}</a>
    </p>

    <p style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#8b8b96;font-size:12px;line-height:1.6;">
      If you didn’t request this, you can safely ignore this email.
    </p>
  `

  const html = renderEmailLayout({
    preheader: "Reset your Smarana password (link expires soon).",
    title,
    appUrl,
    logoUrl,
    topRightLink: { label: "Open Smarana", href: appUrl },
    childrenHtml,
    footerHtml: `Security note: Smarana will never ask you for your password over email.`,
  })

  const text = [
    "Reset your Smarana password",
    "",
    userName?.trim() ? `Hey ${userName.trim()},` : "Hey,",
    "",
    "We received a request to reset your Smarana password.",
    `This link expires in ${expiresMinutes} minutes.`,
    "",
    `Reset link: ${resetUrl}`,
    "",
    "If you didn’t request this, ignore this email.",
  ].join("\n")

  return { subject, html, text }
}
