import "@tanstack/react-start/server-only";
import { setEmailUnsubscribe } from "@lovable.dev/email-js";
import { confirmUrl, readWaitlistConfig, unsubscribeUrl } from "./config.server";
import { logEvent, waitlistDb, type SubscriberRow } from "./db.server";
import { sendEmail } from "./mailer.server";
import { broadcastEmail, confirmEmail, welcomeEmail } from "./templates.server";
import { normaliseEmail, type Deployment, type Persona, type Segment } from "./types";

/**
 * The funnel itself: join → confirm → welcome → updates, plus the status
 * corrections that come back from the provider.
 *
 * Two rules run through all of it. Nothing is ever mailed to an address that
 * has not confirmed, and every state change writes a row to
 * `waitlist_events`, so the dashboard can show a real timeline rather than a
 * current-state guess.
 */

/** A pending subscriber re-submitting inside this window gets no second mail. */
const CONFIRM_RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export type JoinInput = {
  email: string;
  persona?: Persona;
  deployment?: Deployment;
  name?: string;
  company?: string;
  source: string;
  tags?: string[];
  utm?: Record<string, string>;
  referrer?: string;
  accessKey?: string;
};

export type JoinResult =
  | { state: "confirmation_sent" }
  | { state: "confirmation_throttled" }
  | { state: "already_confirmed" }
  | { state: "blocked"; reason: "complained" };

async function findByEmail(email: string): Promise<SubscriberRow | null> {
  const { data, error } = await waitlistDb
    .from("waitlist_subscribers")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(`waitlist lookup failed: ${error.message}`);
  return data;
}

async function sendConfirmation(row: SubscriberRow): Promise<"sent" | "failed"> {
  const config = readWaitlistConfig();
  const email = confirmEmail(config, confirmUrl(config.siteUrl, row.confirm_token));

  const outcome = await sendEmail(config, {
    to: row.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
    // Tied to the token, so a resent confirmation after a token rotation is a
    // genuinely new mail while a duplicate submit is not.
    idempotencyKey: `waitlist-confirm-${row.confirm_token.slice(0, 32)}`,
    label: "waitlist-confirm",
  });

  if (!outcome.ok) {
    await logEvent(row.id, "note", { kind: "confirm_send_failed", error: outcome.error });
    return "failed";
  }

  await waitlistDb
    .from("waitlist_subscribers")
    .update({ last_emailed_at: new Date().toISOString() })
    .eq("id", row.id);
  await logEvent(row.id, "confirm_requested", { messageId: outcome.messageId });
  return "sent";
}

/**
 * Join, or re-join. Returning a shaped result rather than a boolean lets the
 * form say something true: "check your inbox" and "you are already on the
 * list" are different facts and a waitlist that conflates them trains people
 * to re-submit.
 */
export async function join(input: JoinInput): Promise<JoinResult> {
  const email = normaliseEmail(input.email);
  const existing = await findByEmail(email);

  if (!existing) {
    const { data, error } = await waitlistDb
      .from("waitlist_subscribers")
      .insert({
        email,
        source: input.source,
        ...(input.persona ? { persona: input.persona } : {}),
        ...(input.deployment ? { deployment: input.deployment } : {}),
        ...(input.name ? { name: input.name } : {}),
        ...(input.company ? { company: input.company } : {}),
        ...(input.tags?.length ? { tags: input.tags } : {}),
        ...(input.utm ? { utm: input.utm } : {}),
        ...(input.referrer ? { referrer: input.referrer } : {}),
        ...(input.accessKey ? { access_key: input.accessKey } : {}),
      })
      .select("*")
      .single();

    if (error || !data) throw new Error(`waitlist insert failed: ${error?.message ?? "no row"}`);

    await logEvent(data.id, "signup", { source: input.source, persona: data.persona });
    await sendConfirmation(data);
    return { state: "confirmation_sent" };
  }

  // A spam complaint is the one state we do not quietly reopen: the provider
  // refuses to resubscribe those addresses, so promising mail would be a lie.
  if (existing.status === "complained") return { state: "blocked", reason: "complained" };

  // Late answers enrich the record; a blank field never overwrites a known one.
  const enrichment: Partial<SubscriberRow> = {
    ...(input.persona && existing.persona === "unspecified" ? { persona: input.persona } : {}),
    ...(input.deployment && !existing.deployment ? { deployment: input.deployment } : {}),
    ...(input.name && !existing.name ? { name: input.name } : {}),
    ...(input.company && !existing.company ? { company: input.company } : {}),
    ...(input.accessKey ? { access_key: input.accessKey } : {}),
    ...(input.tags?.length ? { tags: Array.from(new Set([...existing.tags, ...input.tags])) } : {}),
  };

  if (Object.keys(enrichment).length > 0) {
    await waitlistDb.from("waitlist_subscribers").update(enrichment).eq("id", existing.id);
  }

  if (existing.status === "confirmed") {
    await logEvent(existing.id, "signup", { source: input.source, repeat: true });
    return { state: "already_confirmed" };
  }

  // pending, unsubscribed or bounced: a fresh explicit opt-in reopens the door,
  // but only through a new confirmation — never by flipping status here.
  const reopened = existing.status !== "pending";
  if (reopened) {
    await waitlistDb
      .from("waitlist_subscribers")
      .update({ status: "pending", unsubscribed_at: null })
      .eq("id", existing.id);
  }

  const lastEmailed = existing.last_emailed_at ? Date.parse(existing.last_emailed_at) : 0;
  if (!reopened && Date.now() - lastEmailed < CONFIRM_RESEND_COOLDOWN_MS) {
    return { state: "confirmation_throttled" };
  }

  await logEvent(existing.id, "signup", { source: input.source, repeat: true });
  await sendConfirmation({ ...existing, status: "pending" });
  return { state: "confirmation_sent" };
}

export type ConfirmResult =
  { ok: true; email: string; alreadyConfirmed: boolean } | { ok: false; reason: "invalid" };

/** The confirmation link. Single use: the token rotates once it is spent. */
export async function confirm(token: string): Promise<ConfirmResult> {
  const { data, error } = await waitlistDb
    .from("waitlist_subscribers")
    .select("*")
    .eq("confirm_token", token)
    .maybeSingle();

  if (error) throw new Error(`waitlist confirm lookup failed: ${error.message}`);
  if (!data) return { ok: false, reason: "invalid" };
  if (data.status === "confirmed") return { ok: true, email: data.email, alreadyConfirmed: true };

  const { data: updated, error: updateError } = await waitlistDb
    .from("waitlist_subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", data.id)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw new Error(`waitlist confirm failed: ${updateError?.message ?? "no row"}`);
  }

  await logEvent(updated.id, "confirmed", {});

  const config = readWaitlistConfig();
  const welcome = welcomeEmail(config, unsubscribeUrl(config.siteUrl, updated.unsubscribe_token));
  const outcome = await sendEmail(config, {
    to: updated.email,
    subject: welcome.subject,
    html: welcome.html,
    text: welcome.text,
    idempotencyKey: `waitlist-welcome-${updated.id}`,
    unsubscribeToken: updated.unsubscribe_token,
    label: "waitlist-welcome",
  });

  if (outcome.ok) {
    await waitlistDb
      .from("waitlist_subscribers")
      .update({ last_emailed_at: new Date().toISOString() })
      .eq("id", updated.id);
    await logEvent(updated.id, "welcomed", { messageId: outcome.messageId });
  } else {
    await logEvent(updated.id, "note", { kind: "welcome_send_failed", error: outcome.error });
  }

  return { ok: true, email: updated.email, alreadyConfirmed: false };
}

export type UnsubscribeResult = { ok: true; email: string } | { ok: false; reason: "invalid" };

export async function unsubscribe(token: string): Promise<UnsubscribeResult> {
  const { data, error } = await waitlistDb
    .from("waitlist_subscribers")
    .select("*")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (error) throw new Error(`waitlist unsubscribe lookup failed: ${error.message}`);
  if (!data) return { ok: false, reason: "invalid" };

  if (data.status !== "unsubscribed") {
    await waitlistDb
      .from("waitlist_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("id", data.id);
    await logEvent(data.id, "unsubscribed", { via: "link" });
  }

  // Tell the provider too, so a send that slips past our own check is still
  // suppressed at the edge.
  try {
    const config = readWaitlistConfig();
    if (!config.dryRun) {
      await setEmailUnsubscribe(
        { recipient: data.email, domain: config.senderDomain, subscribed: false },
        { apiKey: config.apiKey },
      );
    }
  } catch (providerError) {
    console.error(
      "[waitlist] provider unsubscribe failed:",
      providerError instanceof Error ? providerError.message : providerError,
    );
  }

  return { ok: true, email: data.email };
}

/** Status corrections arriving from the provider's webhook. */
export async function applyProviderEvent(
  type: "email.bounced" | "email.complaint" | "email.unsubscribed" | "email.resubscribed",
  recipient: string,
  messageId: string,
): Promise<void> {
  const email = normaliseEmail(recipient);
  const row = await findByEmail(email);
  if (!row) return;

  const next = {
    "email.bounced": { status: "bounced" as const, event: "bounced" as const },
    "email.complaint": { status: "complained" as const, event: "complained" as const },
    "email.unsubscribed": { status: "unsubscribed" as const, event: "unsubscribed" as const },
    "email.resubscribed": { status: "confirmed" as const, event: "resubscribed" as const },
  }[type];

  await waitlistDb
    .from("waitlist_subscribers")
    .update({
      status: next.status,
      ...(next.status === "unsubscribed" ? { unsubscribed_at: new Date().toISOString() } : {}),
    })
    .eq("id", row.id);

  await logEvent(row.id, next.event, { via: "provider", messageId });
}

/* ------------------------------------------------------------------ segments */

function describeSegment(segment: Segment): Record<string, unknown> {
  return {
    ...(segment.persona ? { persona: segment.persona } : {}),
    ...(segment.deployment ? { deployment: segment.deployment } : {}),
    ...(segment.tags?.length ? { tags: segment.tags } : {}),
    ...(segment.since ? { since: segment.since } : {}),
  };
}

/** Confirmed subscribers only — the segment can narrow that set, never widen it. */
async function selectSegment(segment: Segment): Promise<SubscriberRow[]> {
  let query = waitlistDb.from("waitlist_subscribers").select("*").eq("status", "confirmed");

  if (segment.persona) query = query.eq("persona", segment.persona);
  if (segment.deployment) query = query.eq("deployment", segment.deployment);
  if (segment.tags?.length) query = query.contains("tags", segment.tags);
  if (segment.since) query = query.gte("created_at", segment.since);

  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) throw new Error(`waitlist segment query failed: ${error.message}`);
  return data ?? [];
}

export async function countSegment(segment: Segment): Promise<number> {
  return (await selectSegment(segment)).length;
}

export type BroadcastInput = {
  subject: string;
  preheader?: string;
  body: string;
  segment: Segment;
  /** Sends to this address only, and records nothing. For checking a draft. */
  testTo?: string;
};

export type BroadcastResult = {
  broadcastId: string | null;
  recipients: number;
  sent: number;
  failed: number;
};

/**
 * Sends an update to a segment.
 *
 * Sequential by design: a waitlist send is not latency-sensitive, and one
 * address at a time keeps us inside the provider's rate limit without a
 * scheduler. Each recipient gets its own idempotency key, so a retried
 * broadcast resumes rather than duplicates.
 */
export async function sendBroadcast(input: BroadcastInput): Promise<BroadcastResult> {
  const config = readWaitlistConfig();

  if (input.testTo) {
    const email = broadcastEmail(config, input, "test-token-not-a-real-subscriber");
    const outcome = await sendEmail(config, {
      to: normaliseEmail(input.testTo),
      subject: `[test] ${email.subject}`,
      html: email.html,
      text: email.text,
      idempotencyKey: `waitlist-test-${Date.now()}`,
      label: "waitlist-test",
    });
    return {
      broadcastId: null,
      recipients: 1,
      sent: outcome.ok ? 1 : 0,
      failed: outcome.ok ? 0 : 1,
    };
  }

  const recipients = await selectSegment(input.segment);

  const { data: broadcast, error } = await waitlistDb
    .from("waitlist_broadcasts")
    .insert({
      subject: input.subject,
      body: input.body,
      ...(input.preheader ? { preheader: input.preheader } : {}),
      segment: describeSegment(input.segment),
      status: "sending",
      recipient_count: recipients.length,
    })
    .select("*")
    .single();

  if (error || !broadcast) {
    throw new Error(`could not record broadcast: ${error?.message ?? "no row"}`);
  }

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const email = broadcastEmail(config, input, recipient.unsubscribe_token);
    const outcome = await sendEmail(config, {
      to: recipient.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      idempotencyKey: `waitlist-broadcast-${broadcast.id}-${recipient.id}`,
      unsubscribeToken: recipient.unsubscribe_token,
      label: "waitlist-broadcast",
    });

    await waitlistDb.from("waitlist_deliveries").upsert(
      {
        broadcast_id: broadcast.id,
        subscriber_id: recipient.id,
        status: outcome.ok ? "sent" : "failed",
        ...(outcome.ok ? { message_id: outcome.messageId } : { error: outcome.error }),
      },
      { onConflict: "broadcast_id,subscriber_id" },
    );

    if (outcome.ok) {
      sent += 1;
      await waitlistDb
        .from("waitlist_subscribers")
        .update({ last_emailed_at: new Date().toISOString() })
        .eq("id", recipient.id);
      await logEvent(recipient.id, "broadcast_sent", {
        broadcastId: broadcast.id,
        subject: input.subject,
      });
    } else {
      failed += 1;
    }
  }

  await waitlistDb
    .from("waitlist_broadcasts")
    .update({
      status: failed > 0 && sent === 0 ? "failed" : "sent",
      sent_count: sent,
      failed_count: failed,
      sent_at: new Date().toISOString(),
    })
    .eq("id", broadcast.id);

  return { broadcastId: broadcast.id, recipients: recipients.length, sent, failed };
}
