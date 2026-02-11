import { renderEmailLayout } from "../layout";

type ContestReminderEmailProps = {
  appUrl: string;            // e.g. https://smarana.vercel.app
  openSmaranaUrl: string;    // deep link to contest page or /contests
  settingsUrl: string;       // link to notification settings
  userName: string;          // "Jash"
  contestName: string;       // "Weekly Contest 400"
  platform: string;          // "LeetCode" | "Codeforces" | ...
  startsAtLabel: string;     // "Sunday, 10:30 AM (IST)"
  startsInLabel: string;     // "2 days" / "in 3 hours" etc
  contestUrl: string;        // external contest URL
};

// Minimal HTML escape (avoid injection)
const esc = (s: string) =>
  s.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function remindContestEmail({
  appUrl,
  openSmaranaUrl,
  settingsUrl,
  userName,
  contestName,
  platform,
  startsAtLabel,
  startsInLabel,
  contestUrl,
}: ContestReminderEmailProps) {
  const brand = {
    gold: "#BB7331",
    text: "#1C1D21",
    muted: "#5B5E66",
    border: "#E7E7EC",
    soft: "#F7F7FA",
  };

  const logoUrl = `${appUrl}/brand/logo-email.png`;

  const subject = `Contest reminder: ${contestName} starts ${startsInLabel}`;
  const preheader = `${contestName} on ${platform} starts ${startsInLabel}.`;

  const childrenHtml = `
    <div style="margin-top:14px; font-size:16px; line-height:1.6; color:${brand.text};">
      Hey ${esc(userName)},
    </div>

    <div style="margin-top:10px; font-size:16px; line-height:1.6; color:${brand.text};">
      <span style="font-weight:700;">${esc(contestName)}</span>
      on <span style="font-weight:700;">${esc(platform)}</span>
      starts in <span style="font-weight:800; color:${brand.gold};">${esc(startsInLabel)}</span>.
    </div>

    <!-- Details box -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="margin-top:16px; background:${brand.soft}; border:1px solid ${brand.border}; border-radius:14px;">
      <tr>
        <td style="padding:14px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="stack" width="140" style="width:140px; padding:6px 0; color:${brand.muted}; font-size:13px; font-weight:700;">
                Starts
              </td>
              <td class="stack" style="padding:6px 0; color:${brand.text}; font-size:14px; font-weight:700;">
                ${esc(startsAtLabel)}
              </td>
            </tr>
            <tr>
              <td class="stack" width="140" style="width:140px; padding:6px 0; color:${brand.muted}; font-size:13px; font-weight:700;">
                Platform
              </td>
              <td class="stack" style="padding:6px 0; color:${brand.text}; font-size:14px; font-weight:700;">
                ${esc(platform)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;">
      <tr>
        <td>
          <a href="${esc(contestUrl)}"
             class="btn"
             style="
               display:inline-block;
               padding:12px 16px;
               border-radius:14px;
               background:${brand.gold};
               color:#111;
               font-size:14px;
               font-weight:800;
               text-decoration:none;
               border:1px solid rgba(0,0,0,0.08);
             ">
            View contest
          </a>
        </td>
      </tr>
    </table>

    <!-- Small helper -->
    <div style="margin-top:14px; font-size:13px; color:${brand.muted}; line-height:1.6;">
      Tip: If you prefer fewer pings, you can manage reminders in
      <a href="${esc(settingsUrl)}" style="color:${brand.gold}; text-decoration:none; font-weight:700;">Settings</a>.
    </div>
  `;

  const html = renderEmailLayout({
    preheader,
    title: "Contest reminder",
    appUrl,
    logoUrl,
    openSmaranaUrl,
    childrenHtml,
    cardFooterHtml: "You’re receiving this because contest reminders are enabled for your account.",
  });

  const text =
    `Smarana — contest reminder

Hey ${userName},

${contestName} on ${platform} starts in ${startsInLabel}.
Starts: ${startsAtLabel}

View contest: ${contestUrl}

Manage reminders: ${settingsUrl}
`;

  return { subject, html, text };
}
