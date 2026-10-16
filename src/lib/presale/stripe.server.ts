import "@tanstack/react-start/server-only";

/**
 * A small Stripe client over `fetch`.
 *
 * The site deploys to a Workers-style runtime, so this avoids the Node SDK and
 * talks to the REST API directly. It covers exactly what the presale needs:
 * create a Checkout Session, and verify a webhook signature.
 */

const API = "https://api.stripe.com/v1";

export class StripeNotConfiguredError extends Error {
  constructor() {
    super("STRIPE_SECRET_KEY is not set");
  }
}

function secretKey(): string {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new StripeNotConfiguredError();
  return key;
}

/** Stripe takes form-encoded bodies with bracketed keys for nesting: `a[b][0]=c`. */
function encode(value: unknown, prefix: string, out: URLSearchParams): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => encode(item, `${prefix}[${i}]`, out));
  } else if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) encode(v, `${prefix}[${k}]`, out);
  } else {
    out.append(prefix, String(value));
  }
}

function form(params: Record<string, unknown>): URLSearchParams {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) encode(v, k, out);
  return out;
}

export type CheckoutParams = {
  email: string;
  quantity: number;
  unitAmount: number;
  currency: string;
  productName: string;
  productDescription: string;
  paymentDescription: string;
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  /** When set, Stripe collects a shipping address limited to these countries. */
  shippingCountries?: string[];
};

export async function createCheckoutSession(
  p: CheckoutParams,
): Promise<{ id: string; url: string }> {
  const body = form({
    mode: "payment",
    customer_email: p.email,
    line_items: [
      {
        quantity: p.quantity,
        price_data: {
          currency: p.currency,
          unit_amount: p.unitAmount,
          product_data: { name: p.productName, description: p.productDescription },
        },
      },
    ],
    ...(p.shippingCountries?.length
      ? { shipping_address_collection: { allowed_countries: p.shippingCountries } }
      : {}),
    phone_number_collection: { enabled: Boolean(p.shippingCountries?.length) },
    metadata: p.metadata,
    payment_intent_data: { description: p.paymentDescription, metadata: p.metadata },
    success_url: p.successUrl,
    cancel_url: p.cancelUrl,
  });

  const response = await fetch(`${API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await response.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !json.id || !json.url) {
    throw new Error(`Stripe checkout failed (${response.status}): ${json.error?.message ?? "no detail"}`);
  }
  return { id: json.id, url: json.url };
}

/* ------------------------------------------------------------------ webhooks */

export type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison, so a signature can't be guessed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Checks the `Stripe-Signature` header against the raw request body and
 * returns the parsed event. Throws on a bad signature or a stale timestamp.
 */
export async function verifyWebhook(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
): Promise<StripeEvent> {
  if (!header) throw new Error("Missing Stripe-Signature header");

  const parts = header.split(",").map((s) => s.split("=") as [string, string]);
  const timestamp = parts.find(([k]) => k === "t")?.[1];
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!timestamp || signatures.length === 0) throw new Error("Malformed Stripe-Signature header");

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) throw new Error("Stripe signature timestamp outside tolerance");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = hex(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`)),
  );
  if (!signatures.some((sig) => safeEqual(sig, expected))) throw new Error("Stripe signature mismatch");

  return JSON.parse(rawBody) as StripeEvent;
}
