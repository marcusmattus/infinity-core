import "@tanstack/react-start/server-only";
import { logEvent, waitlistDb, type SubscriberRow } from "./db.server";
import { normaliseEmail } from "./types";

/**
 * The reservation deposit: Stripe Checkout behind the waitlist.
 *
 * Talks to Stripe's REST API with `fetch` rather than the SDK, so it runs the
 * same on the Cloudflare/Nitro target as in Node, and verifies webhooks with
 * Web Crypto. Uses the same variable names as holodock-web's presale
 * (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, DEPOSIT_AMOUNT, DEPOSIT_CURRENCY),
 * so one Stripe account can serve both sites.
 *
 * With no STRIPE_SECRET_KEY set the deposit is simply "not open yet": the
 * waitlist keeps working and the page says so instead of failing.
 */

const STRIPE_API = "https://api.stripe.com/v1";
/** Stripe's own default: reject webhook timestamps older than five minutes. */
const WEBHOOK_TOLERANCE_SECONDS = 300;

export type DepositConfig = {
  open: boolean;
  amount: number;
  currency: string;
  label: string;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
}

/** Price shown on the page and charged in Stripe come from the same two variables. */
export function depositConfig(): DepositConfig {
  const parsed = Number.parseInt(process.env["DEPOSIT_AMOUNT"] ?? "4900", 10);
  const amount = Number.isFinite(parsed) && parsed > 0 ? parsed : 4900;
  const currency = (process.env["DEPOSIT_CURRENCY"] ?? "gbp").toLowerCase();
  return {
    open: Boolean(process.env["STRIPE_SECRET_KEY"]),
    amount,
    currency,
    label: formatMoney(amount, currency),
  };
}

function siteUrl(): string {
  return (process.env["SITE_URL"] ?? "https://infinityid.labs").replace(/\/+$/, "");
}

/** Stripe wants form encoding with bracketed keys for nested objects. */
function formBody(fields: Record<string, string | number | boolean>): URLSearchParams {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) body.append(key, String(value));
  return body;
}

async function stripeRequest<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: URLSearchParams; idempotencyKey?: string },
): Promise<T> {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new DepositClosedError();

  const response = await fetch(`${STRIPE_API}${path}`, {
    method: init.method,
    headers: {
      authorization: `Bearer ${key}`,
      ...(init.body ? { "content-type": "application/x-www-form-urlencoded" } : {}),
      ...(init.idempotencyKey ? { "idempotency-key": init.idempotencyKey } : {}),
    },
    ...(init.body ? { body: init.body } : {}),
  });

  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(`Stripe ${path} failed: ${payload.error?.message ?? response.status}`);
  }
  return payload;
}

export class DepositClosedError extends Error {
  constructor() {
    super("Deposits are not open yet.");
    this.name = "DepositClosedError";
  }
}

type CheckoutSession = {
  id: string;
  url: string | null;
  status: "open" | "complete" | "expired";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  amount_total: number | null;
  currency: string | null;
  customer: string | null;
  customer_details?: { email?: string | null } | null;
  payment_intent: string | null;
  metadata?: Record<string, string> | null;
};

async function findSubscriber(email: string): Promise<SubscriberRow | null> {
  const { data, error } = await waitlistDb
    .from("waitlist_subscribers")
    .select("*")
    .eq("email", normaliseEmail(email))
    .maybeSingle();
  if (error) throw new Error(`waitlist lookup failed: ${error.message}`);
  return data;
}

async function updateSubscriber(id: string, patch: Partial<SubscriberRow>): Promise<void> {
  const { error } = await waitlistDb.from("waitlist_subscribers").update(patch).eq("id", id);
  if (error) throw new Error(`waitlist deposit update failed: ${error.message}`);
}

export type StartDepositResult =
  | { state: "checkout"; url: string }
  | { state: "already_paid" }
  | { state: "not_on_list" }
  | { state: "closed" };

/**
 * Opens a Checkout session for someone already on the waitlist. Joining first
 * is what gives the deposit a CRM record to land on and a confirmed address
 * to write to about the reservation.
 */
export async function startDeposit(email: string): Promise<StartDepositResult> {
  const config = depositConfig();
  if (!config.open) return { state: "closed" };

  const subscriber = await findSubscriber(email);
  if (!subscriber) return { state: "not_on_list" };
  if (subscriber.deposit_status === "paid") return { state: "already_paid" };

  const base = siteUrl();
  const session = await stripeRequest<CheckoutSession>("/checkout/sessions", {
    method: "POST",
    // One open session per person per minute: a double click returns the same one.
    idempotencyKey: `deposit-${subscriber.id}-${Math.floor(Date.now() / 60_000)}`,
    body: formBody({
      mode: "payment",
      customer_email: subscriber.email,
      client_reference_id: subscriber.id,
      "line_items[0][quantity]": 1,
      "line_items[0][price_data][currency]": config.currency,
      "line_items[0][price_data][unit_amount]": config.amount,
      "line_items[0][price_data][product_data][name]": "HoloDock — reservation deposit",
      "line_items[0][price_data][product_data][description]":
        "Fully refundable. Counts towards the price; the balance is due before dispatch.",
      "metadata[subscriber_id]": subscriber.id,
      "metadata[kind]": "waitlist_deposit",
      "payment_intent_data[description]": "HoloDock reservation deposit",
      "payment_intent_data[metadata][subscriber_id]": subscriber.id,
      success_url: `${base}/waitlist/reserved?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/waitlist?deposit=cancelled`,
    }),
  });

  if (!session.url) throw new Error("Stripe returned a Checkout session without a URL.");

  await updateSubscriber(subscriber.id, {
    deposit_status: "pending",
    deposit_amount: config.amount,
    deposit_currency: config.currency,
    stripe_checkout_session_id: session.id,
  });
  await logEvent(subscriber.id, "deposit_started", {
    session: session.id,
    amount: config.amount,
    currency: config.currency,
  });

  return { state: "checkout", url: session.url };
}

/** What the return page shows. Reads Stripe, not our table, so it is right even before the webhook lands. */
export async function depositSessionStatus(
  sessionId: string,
): Promise<{ paid: boolean; label: string | null; email: string | null }> {
  const session = await stripeRequest<CheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { method: "GET" },
  );
  if (session.metadata?.["kind"] !== "waitlist_deposit")
    return { paid: false, label: null, email: null };
  return {
    paid: session.payment_status === "paid",
    label:
      session.amount_total != null && session.currency
        ? formatMoney(session.amount_total, session.currency)
        : null,
    email: session.customer_details?.email ?? null,
  };
}

/* ------------------------------------------------------------------ webhook */

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Stripe's `Stripe-Signature` scheme: HMAC-SHA256 over `${t}.${payload}`. */
async function verifySignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = header.split(",").map((part) => part.split("=") as [string, string]);
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > WEBHOOK_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = hex(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`)),
  );
  return signatures.some((signature) => safeEqual(signature, expected));
}

type StripeEvent = {
  type: string;
  data: { object: Record<string, unknown> };
};

async function subscriberFor(session: CheckoutSession): Promise<SubscriberRow | null> {
  const id = session.metadata?.["subscriber_id"];
  if (!id) return null;
  const { data } = await waitlistDb
    .from("waitlist_subscribers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

/**
 * Subscribe the Stripe endpoint `${SITE_URL}/api/waitlist/stripe` to:
 * checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.expired and charge.refunded.
 */
export async function handleStripeWebhook(request: Request): Promise<Response> {
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!secret) return new Response("Stripe webhook is not configured", { status: 503 });

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";
  if (!(await verifySignature(payload, signature, secret))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as unknown as CheckoutSession;
      if (session.metadata?.["kind"] !== "waitlist_deposit" || session.payment_status !== "paid")
        break;
      const subscriber = await subscriberFor(session);
      if (!subscriber || subscriber.deposit_status === "paid") break;
      await updateSubscriber(subscriber.id, {
        deposit_status: "paid",
        deposit_paid_at: new Date().toISOString(),
        deposit_amount: session.amount_total,
        deposit_currency: session.currency,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        stripe_customer_id: session.customer,
        tags: Array.from(new Set([...subscriber.tags, "deposit"])),
      });
      await logEvent(subscriber.id, "deposit_paid", {
        session: session.id,
        amount: session.amount_total,
        currency: session.currency,
      });
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as unknown as CheckoutSession;
      if (session.metadata?.["kind"] !== "waitlist_deposit") break;
      const subscriber = await subscriberFor(session);
      // Only roll back the session we are waiting on; an older one expiring means nothing.
      if (
        subscriber &&
        subscriber.deposit_status === "pending" &&
        subscriber.stripe_checkout_session_id === session.id
      ) {
        await updateSubscriber(subscriber.id, { deposit_status: "none" });
        await logEvent(subscriber.id, "deposit_expired", { session: session.id });
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as { refunded?: boolean; payment_intent?: string | null };
      // A partial refund leaves the reservation standing.
      if (!charge.refunded || !charge.payment_intent) break;
      const { data: subscriber } = await waitlistDb
        .from("waitlist_subscribers")
        .select("*")
        .eq("stripe_payment_intent_id", charge.payment_intent)
        .maybeSingle();
      if (!subscriber) break;
      await updateSubscriber(subscriber.id, {
        deposit_status: "refunded",
        tags: subscriber.tags.filter((tag) => tag !== "deposit"),
      });
      await logEvent(subscriber.id, "deposit_refunded", { payment_intent: charge.payment_intent });
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
