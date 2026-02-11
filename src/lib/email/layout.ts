type EmailLayoutProps = {
  preheader?: string
  title?: string
  appUrl: string
  logoUrl: string
  openSmaranaUrl?: string
  childrenHtml: string
  // Optional footer text for the card footer strip
  cardFooterHtml?: string
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

export function renderEmailLayout({
  preheader,
  title,
  appUrl,
  logoUrl,
  openSmaranaUrl,
  childrenHtml,
  cardFooterHtml,
}: EmailLayoutProps) {
  const brand = {
    gold: "#BB7331",
    ink: "#111214",
    text: "#1C1D21",
    muted: "#5B5E66",
    border: "#E7E7EC",
    surface: "#FFFFFF",
    soft: "#F7F7FA",
  }

  const safeTitle = title ? escapeHtml(title) : ""
  const targetUrl = openSmaranaUrl || appUrl

  // Logo chip logic: The user wants a dark chip to show the white logo.
  // If logoUrl is passed, we wrap it.

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <title>${safeTitle}</title>
  <style>
    /* Gmail supports embedded CSS; keep it minimal */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .px { padding-left: 18px !important; padding-right: 18px !important; }
      .btn { width: 100% !important; }
      .stack { display: block !important; width: 100% !important; }
      .text-center-sm { text-align: center !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background:${brand.surface}; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji'; color:${brand.text};">
  <!-- Preheader (hidden) -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    ${preheader ? escapeHtml(preheader) : ""}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${brand.surface};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="container" style="width:600px; max-width:600px;">

          <!-- Header -->
          <tr>
            <td class="px" style="padding:0 24px 14px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle" style="padding:0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td valign="middle" style="padding:0 10px 0 0;">
                          <!-- Logo chip (keeps white logo visible on white email) -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-radius:12px; background:#0B0F16; box-shadow:0 6px 18px rgba(0,0,0,0.12);">
                            <tr>
                              <td style="padding:9px;">
                                <img src="cid:smarana-logo" width="22" height="22" alt="Smarana" style="display:block; border:0; outline:none; text-decoration:none;" />
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="middle" style="padding:0;">
                          <div style="font-size:16px; font-weight:700; color:#111827; line-height:1.2; letter-spacing:-0.2px;">
                            Smarana <span style="font-weight:500; color:#6B7280;">• spaced repetition for algorithms</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle" style="padding:0;">
                    <a href="${targetUrl}"
                       style="font-size:14px; font-weight:600; color:${brand.gold}; text-decoration:none;">
                      Open Smarana →
                    </a>
                  </td>
                </tr>
              </table>

              <div style="height:1px; background:${brand.border}; margin-top:14px;"></div>
              <div style="height:3px; width:72px; background:${brand.gold}; border-radius:999px; margin-top:10px;"></div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td class="px" style="padding:0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                     style="border:1px solid ${brand.border}; border-radius:18px; overflow:hidden; background:${brand.surface};">
                <tr>
                  <td style="padding:22px 22px 10px 22px;">
                    ${safeTitle
      ? `<div style="font-size:30px; font-weight:800; letter-spacing:-0.6px; line-height:1.15; margin-bottom: 14px;">
                        ${safeTitle}
                       </div>`
      : ""
    }
                    
                    ${childrenHtml}
                  </td>
                </tr>

                <!-- Footer strip -->
                <tr>
                  <td style="padding:14px 22px; border-top:1px solid ${brand.border}; background:#fff;">
                    <div style="font-size:12px; color:${brand.muted}; line-height:1.5;">
                      ${cardFooterHtml || "You’re receiving this because you signed up for Smarana."}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Global footer -->
          <tr>
            <td class="px" style="padding:18px 24px 0 24px;">
              <div style="font-size:12px; color:${brand.muted}; line-height:1.6;">
                If you didn’t expect this email, you can ignore it.
              </div>
              <div style="margin-top:8px; font-size:12px; color:${brand.muted};">
                © ${new Date().getFullYear()} Smarana · “Remembrance is the root of knowledge”
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
