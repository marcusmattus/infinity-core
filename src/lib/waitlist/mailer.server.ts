import "@tanstack/react-start/server-only";
import { EmailAPIError, sendLovableEmail } from "@lovable.dev/email-js";
import type { WaitlistConfig } from "./config.server";

export type SendOutcome =
  { ok: true; messageId: string | null } | { ok: false; error: string; retryable: boolean };

export type SendInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /**
   * Makes a retried send a no-op at the API rather than a second copy in
   * someone's inbox. Always derived from what the mail is *about*, never from
   * the clock.
   */
  idempotencyKey: string;
  /** Wires the mail client's native unsubscribe button to this subscriber. */
  unsubscribeToken?: string;
  /** Groups sends in the provider's logs: "confirm", "welcome", "broadcast". */
  label: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One send, with a single retry when the provider says the failure is
 * transient. Anything else returns a failure the caller records — a broadcast
 * must not abort halfway because one address is undeliverable.
 */
export async function sendEmail(config: WaitlistConfig, input: SendInput): Promise<SendOutcome> {
  if (config.dryRun) {
    console.info(`[waitlist] dry run — would send "${input.subject}" to ${input.to}`);
    return { ok: true, messageId: null };
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await sendLovableEmail(
        {
          to: input.to,
          from: config.from,
          sender_domain: config.senderDomain,
          subject: input.subject,
          html: input.html,
          text: input.text,
          purpose: "transactional",
          idempotency_key: input.idempotencyKey,
          label: input.label,
          ...(config.replyTo ? { reply_to: config.replyTo } : {}),
          ...(input.unsubscribeToken ? { unsubscribe_token: input.unsubscribeToken } : {}),
        },
        { apiKey: config.apiKey },
      );

      return { ok: true, messageId: response.message_id ?? null };
    } catch (error) {
      const apiError = error instanceof EmailAPIError ? error : null;
      const retryable = apiError?.retryable ?? false;
      const message = error instanceof Error ? error.message : String(error);

      if (retryable && attempt === 0) {
        // Respect the provider's backoff, but never hold a request open long.
        await sleep(Math.min((apiError?.retryAfterSeconds ?? 1) * 1000, 5000));
        continue;
      }

      console.error(`[waitlist] send to ${input.to} failed:`, message);
      return { ok: false, error: message, retryable };
    }
  }

  return { ok: false, error: "send retries exhausted", retryable: true };
}
