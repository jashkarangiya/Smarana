type EmailLayoutProps = {
    preheader?: string
    title: string
    brandLine?: string // e.g. "spaced repetition for algorithms"
    appUrl: string
    logoUrl: string
    topRightLink?: { label: string; href: string }
    childrenHtml: string
    footerHtml?: string
}

const escapeHtml = (s: string) =>
    s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")

export function renderEmailLayout({
    preheader,
    title,
    brandLine = "spaced repetition for algorithms",
    appUrl,
    logoUrl,
    topRightLink,
    childrenHtml,
    footerHtml,
}: EmailLayoutProps) {
    const safeTitle = escapeHtml(title)

    const preheaderBlock = preheader
        ? `
    <div style="display:none;font-size:1px;color:#0b0b0d;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
      ${escapeHtml(preheader)}
    </div>
  `
        : ""

    const rightLink = topRightLink
        ? `<a href="${topRightLink.href}" style="color:#BB7331;text-decoration:none;font-weight:600;font-size:13px;">${escapeHtml(
            topRightLink.label
        )} →</a>`
        : `<a href="${appUrl}" style="color:#BB7331;text-decoration:none;font-weight:600;font-size:13px;">Open Smarana →</a>`

    // Note: table layout for email compatibility
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b0d;">
  ${preheaderBlock}

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0b0b0d;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="padding:0 0 14px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <a href="${appUrl}" style="text-decoration:none;">
                      <img src="${logoUrl}" width="28" height="28" alt="Smarana" style="display:inline-block;vertical-align:middle;border:0;outline:none;text-decoration:none;border-radius:6px;">
                      <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#ffffff;font-weight:700;font-size:16px;">
                        Smarana
                      </span>
                      <span style="display:inline-block;vertical-align:middle;margin-left:8px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#a3a3ad;font-weight:500;font-size:13px;">
                        • ${escapeHtml(brandLine)}
                      </span>
                    </a>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    ${rightLink}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td style="height:2px;background:#BB7331;border-radius:999px;"></td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="padding:18px 0 0 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background:#101014;border:1px solid #24242c;border-radius:18px;">
                <tr>
                  <td style="padding:22px 22px 18px 22px;">
                    <h1 style="margin:0 0 10px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#ffffff;font-weight:800;font-size:24px;line-height:1.2;">
                      ${safeTitle}
                    </h1>

                    ${childrenHtml}
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 22px 18px 22px;border-top:1px solid #1f1f26;">
                    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#8b8b96;font-size:12px;line-height:1.5;">
                      ${footerHtml ?? `© ${new Date().getFullYear()} Smarana • “Remembrance is the root of knowledge”`}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom spacing -->
          <tr><td style="height:18px;"></td></tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
