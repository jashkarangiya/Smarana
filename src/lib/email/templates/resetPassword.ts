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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

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

  // Brand colors for inline styles
  const brand = {
    text: "#1C1D21",
    muted: "#5B5E66",
    soft: "#F7F7FA",
    border: "#E7E7EC",
    gold: "#BB7331",
  }

  const childrenHtml = `
    <div style="margin-top:14px; font-size:16px; line-height:1.6; color:${brand.text};">
      ${greeting}
    </div>

    <div style="margin-top:10px; font-size:16px; line-height:1.6; color:${brand.text};">
      We received a request to reset your Smarana password. Click the button below to choose a new one.
    </div>

    <div style="margin:16px 0 16px 0; padding:12px 14px; background:${brand.soft}; border:1px solid ${brand.border}; border-radius:14px;">
      <div style="margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; color:${brand.muted}; font-size:13px; line-height:1.5;">
        This link expires in <strong style="color:${brand.text};">${expiresMinutes} minutes</strong>.
      </div>
    </div>

    <div style="margin:18px 0 10px 0;">
      <a href="${resetUrl}"
         style="display:inline-block; background:${brand.gold}; color:#111; text-decoration:none;
                font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
                font-weight:800; font-size:14px; padding:12px 18px; border-radius:14px; border:1px solid rgba(0,0,0,0.08);">
        Reset Password
      </a>
    </div>

    <div style="margin-top:16px; font-size:13px; color:${brand.muted}; line-height:1.6;">
      If the button doesn’t work, copy and paste this link:
    </div>

    <div style="margin:4px 0 16px 0; font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;
              color:${brand.gold}; font-size:12px; line-height:1.5; word-break:break-all;">
      <a href="${resetUrl}" style="color:${brand.gold}; text-decoration:underline;">${resetUrl}</a>
    </div>

    <div style="margin-top:16px; font-size:13px; color:${brand.muted}; line-height:1.6;">
      If you didn’t request this, you can safely ignore this email.
    </div>
  `

  const html = renderEmailLayout({
    preheader: "Reset your Smarana password (link expires soon).",
    title,
    appUrl,
    logoUrl,
    childrenHtml,
    cardFooterHtml: "Security note: Smarana will never ask you for your password over email.",
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
