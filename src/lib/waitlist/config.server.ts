import "@tanstack/react-start/server-only";

/**
 * Everything the funnel needs from the environment, read in one place so a
 * missing variable fails with the variable's name rather than a 500 from the
 * email API three calls later.
 */
export type WaitlistConfig = {
  apiKey: string;
  from: { name: string; address: string };
  senderDomain: string;
  replyTo: string | null;
  siteUrl: string;
  /** Rendered in the footer when set — bulk mail is expected to carry one. */
  postalAddress: string | null;
  /** `WAITLIST_EMAIL_DRY_RUN=1` logs sends instead of making them. */
  dryRun: boolean;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. The waitlist funnel needs it to send mail — see .env.example.`,
    );
  }
  return value;
}

function optional(name: string): string | null {
  const value = process.env[name];
  return value && value.length > 0 ? value : null;
}

export function readWaitlistConfig(): WaitlistConfig {
  const address = required("WAITLIST_FROM_ADDRESS");
  const domain = optional("WAITLIST_SENDER_DOMAIN") ?? address.split("@")[1] ?? "";
  if (!domain) throw new Error("WAITLIST_FROM_ADDRESS must be a full email address.");

  return {
    apiKey: required("LOVABLE_API_KEY"),
    from: { name: optional("WAITLIST_FROM_NAME") ?? "InfinityID Labs", address },
    senderDomain: domain,
    replyTo: optional("WAITLIST_REPLY_TO"),
    siteUrl: (optional("SITE_URL") ?? "https://infinityid.labs").replace(/\/+$/, ""),
    postalAddress: optional("WAITLIST_POSTAL_ADDRESS"),
    dryRun: process.env["WAITLIST_EMAIL_DRY_RUN"] === "1",
  };
}

/**
 * The dashboard's shared secret. Deliberately separate from the Supabase keys:
 * it gates reads of subscriber data, so it must be rotatable on its own.
 */
export function readAdminToken(): string {
  const token = process.env["WAITLIST_ADMIN_TOKEN"];
  if (!token || token.length < 24) {
    throw new Error(
      "WAITLIST_ADMIN_TOKEN is missing or shorter than 24 characters. Set a long random value before using the waitlist dashboard.",
    );
  }
  return token;
}

export function confirmUrl(siteUrl: string, token: string): string {
  return `${siteUrl}/api/waitlist/confirm?token=${encodeURIComponent(token)}`;
}

export function unsubscribeUrl(siteUrl: string, token: string): string {
  return `${siteUrl}/api/waitlist/unsubscribe?token=${encodeURIComponent(token)}`;
}
