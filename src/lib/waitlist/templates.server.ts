import "@tanstack/react-start/server-only";
import { escapeHtml, renderBodyHtml, renderBodyText } from "./markdown";
import type { WaitlistConfig } from "./config.server";
import { unsubscribeUrl } from "./config.server";

/**
 * The three emails the funnel sends, in one place.
 *
 * Table layout and inline styles throughout: email clients strip <style>
 * blocks and ignore most of flexbox. The palette is the site's — near-black
 * ground, electric blue accent — with light-background fallbacks, since a
 * handful of clients force a light theme regardless of what we ask for.
 */

const BG = "#0a0e17";
const PANEL = "#111725";
const BORDER = "#222c3f";
const TEXT = "#c3cada";
const BRIGHT = "#f5f7fa";
const ACCENT = "#7aa6ff";

export type RenderedEmail = { subject: string; html: string; text: string };

function shell({
  config,
  preheader,
  heading,
  bodyHtml,
  cta,
  unsubscribeHref,
  footerNote,
}: {
  config: WaitlistConfig;
  preheader: string;
  heading: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  unsubscribeHref: string | null;
  footerNote?: string;
}): string {
  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px">
         <tr><td style="background:#1677ff;border-radius:2px">
           <a href="${cta.href}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none">${escapeHtml(
             cta.label,
           )}</a>
         </td></tr>
       </table>`
    : "";

  const unsubscribe = unsubscribeHref
    ? `<a href="${unsubscribeHref}" style="color:#6c7791;text-decoration:underline">Unsubscribe</a>`
    : "";

  const postal = config.postalAddress
    ? `<div style="margin-top:8px">${escapeHtml(config.postalAddress)}</div>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};color:${TEXT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG}">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${PANEL};border:1px solid ${BORDER};border-radius:4px">
        <tr>
          <td style="padding:28px 32px 0">
            <div style="font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${ACCENT}">InfinityID Labs</div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 32px">
            <h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;font-weight:600;color:${BRIGHT}">${escapeHtml(
              heading,
            )}</h1>
            ${bodyHtml}
            ${button}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid ${BORDER};font-size:12px;line-height:1.6;color:#6c7791">
            ${footerNote ? `<div style="margin-bottom:8px">${escapeHtml(footerNote)}</div>` : ""}
            ${unsubscribe}
            ${postal}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function confirmEmail(config: WaitlistConfig, href: string): RenderedEmail {
  const body = [
    "You asked to hear about HoloDock and SpatialOS. Confirm the address and you are on the list.",
    "If this was not you, ignore this message — nothing is subscribed until you confirm.",
  ];

  return {
    subject: "Confirm your HoloDock waitlist spot",
    html: shell({
      config,
      preheader: "One tap to confirm your place on the HoloDock waitlist.",
      heading: "Confirm your place",
      bodyHtml: body
        .map(
          (line) =>
            `<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:${TEXT}">${escapeHtml(line)}</p>`,
        )
        .join(""),
      cta: { label: "Confirm my email", href },
      unsubscribeHref: null,
      footerNote: "You received this because someone entered this address on infinityid.labs.",
    }),
    text: `${body.join("\n\n")}\n\nConfirm: ${href}\n`,
  };
}

export function welcomeEmail(config: WaitlistConfig, unsubscribeHref: string): RenderedEmail {
  const bodyHtml = renderBodyHtml(
    [
      "You are on the list. Here is what that means in practice:",
      "- **Dev kit** — you hear before general availability, with the hardware timeline as it firms up.",
      "- **SpatialOS SDK** — simulator access first, so you can build before a dock reaches your desk.",
      "- **MCP Gateway** — when the gateway opens to outside servers, you get the connection details.",
      "No drip sequence and no weekly newsletter. You will hear from us when something actually ships.",
      `In the meantime, the device teardown is live: [explore the HoloDock](${config.siteUrl}/holodock).`,
    ].join("\n\n"),
    ACCENT,
  );

  return {
    subject: "You're on the HoloDock waitlist",
    html: shell({
      config,
      preheader: "Confirmed. Here is what you will hear about, and when.",
      heading: "You're on the list",
      bodyHtml,
      cta: { label: "Explore the HoloDock", href: `${config.siteUrl}/holodock` },
      unsubscribeHref,
    }),
    text: `${renderBodyText(
      [
        "You are on the list. Here is what that means in practice:",
        "- Dev kit — you hear before general availability.",
        "- SpatialOS SDK — simulator access first.",
        "- MCP Gateway — connection details when it opens.",
        "No drip sequence and no weekly newsletter. You will hear from us when something actually ships.",
      ].join("\n\n"),
    )}\n\nExplore the HoloDock: ${config.siteUrl}/holodock\n\nUnsubscribe: ${unsubscribeHref}\n`,
  };
}

export function broadcastEmail(
  config: WaitlistConfig,
  input: { subject: string; preheader?: string | null; body: string },
  unsubscribeToken: string,
): RenderedEmail {
  const unsubscribeHref = unsubscribeUrl(config.siteUrl, unsubscribeToken);

  return {
    subject: input.subject,
    html: shell({
      config,
      preheader: input.preheader ?? input.subject,
      heading: input.subject,
      bodyHtml: renderBodyHtml(input.body, ACCENT),
      unsubscribeHref,
    }),
    text: `${input.subject}\n\n${renderBodyText(input.body)}\n\nUnsubscribe: ${unsubscribeHref}\n`,
  };
}
